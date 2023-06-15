const solc = require("solc");
import { findBestMatch } from "string-similarity";
import { ethers } from "ethers";
import chains from "@/lib/chains.json";
import { ChainData, Contract, DeployResults } from "@/lib/types";
import uploadToIpfs, { UploadResult } from '@/lib/uploadToIpfs';
import handleImports from "@/lib/handleImports";
import axios from "axios";
import { flattenSolidity } from "./flattener";

type ContractsType = Contract[];

let contracts: ContractsType = [];

const evmVersions = {
  "homestead": "0.1.3",
  "tangerineWhistle": "0.3.6",
  "spuriousDragon": "0.4.0",
  "byzantium": "0.4.22",
  "constantinople": "0.5.5",
  "petersburg": "0.5.5",
  "istanbul": "0.5.13",
  "berlin": "0.8.0",
  "london": "0.8.7",
  "paris": "0.8.18",
  "shanghai": "0.8.2"
};

export const getContracts = (): ContractsType => {
  return contracts;
};

export const createContract = (contract: Contract) => {
  contracts = [...contracts, contract];
};

export const deleteContract = (contract: Contract): void => {
  const index = contracts.findIndex((item) => item.address === contract.address);
  if (index !== -1) {
    contracts.splice(index, 1);
  }
};


export const deployContract = async (
  name: string,
  chain: string,
  sourceCode: string,
  constructorArgs?: Array<string>
): Promise<DeployResults> => {
  // get the chain object from the chains.json file. Direct match || partial match
  const findAttempt = chains.find((item) => item.name.toLowerCase() === chain.toLowerCase());
  const chainData: ChainData = findAttempt?.chainId
    ? findAttempt
    : (chains.find((chainItem) => {
      const formattedChain = chainItem.name.toLowerCase().replace(/[-_]/g, "");
      const formattedInput = chain.toLowerCase().replace(/[-_]/g, "");
      return (
        findBestMatch(
          formattedInput,
          chains.map((item) => item?.name?.toLowerCase().replace(/[-_]/g, ""))
        ).bestMatch.target === formattedChain
      );
    }) as ChainData);

  if (!chainData?.chainId) {
    const error = new Error(`Chain ${chain} not found`);
    console.log(error);
  }

  const fileName = (name ? name.replace(/[\/\\:*?"<>|.\s]+$/g, "_") : "contract") + ".sol";


  // Prepare the sources object for the Solidity compiler
  const handleImportsResult = await handleImports(sourceCode);
  const sources = {
    [fileName]: {
      content: handleImportsResult?.sourceCode,
    },
    ...handleImportsResult?.sources,
  };

  // Compile the contract
  const StandardJsonInput = {
    language: "Solidity",
    sources,
    settings: {
      evmVersion: "london",
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(StandardJsonInput)));
  if (output.errors) {
    // Filter out warnings
    const errors = output.errors.filter(
      (error: { severity: string }) => error.severity === "error"
    );
    if (errors.length > 0) {
      const error = new Error(errors[0].formattedMessage);
      console.log(error);
    }
  }
  const contract = output.contracts[fileName];

  // Get the contract ABI and bytecode
  const contractName = Object.keys(contract)[0];
  const abi = contract[contractName].abi;
  const bytecode = contract[contractName].evm.bytecode.object;



  // Prepare network, signer, and contract instance inject INFURA_API_KEY if needed
  const rpcUrl: string = chainData?.rpc?.[0]?.replace(
    "${INFURA_API_KEY}",
    process.env.INFURA_API_KEY || ""
  );

  //Prepare provider and signer
  const provider =
    rpcUrl && chainData.chainId
      ? new ethers.providers.JsonRpcProvider(rpcUrl, chainData.chainId)
      : ethers.getDefaultProvider(chainData.chainId);
  if (!(await provider.getNetwork())?.chainId) {
    const error = new Error(`Provider for chain ${chainData.name} not available`);
    console.log(error);
  }

  const signer = new ethers.Wallet("0x" + process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
  if (!(await signer.getAddress())) {
    const error = new Error(`Signer for chain ${chainData.name} not available`);
    console.log(error);
  }
  console.log("Provider and signer OK");

  // Create the contract factory
  const factory = await new ethers.ContractFactory(abi, bytecode, signer);

  // Deploy the contract
  const contractDeployment = await factory.deploy(...(constructorArgs ?? []));
  // Retrieve encoded constructor arguments
  const transactionData = contractDeployment.deployTransaction?.data;
  const encodedConstructorArgs = transactionData.slice(bytecode?.length + 2);
  const contractAddress = contractDeployment.address;
  const explorerUrl = `${chainData?.explorers?.[0].url}/address/${contractAddress}`;
  console.log("Contract deployment OK");

  // Add the flattened source code to the sources object
  // const flattenedCode = flattenSolidity(sources);
  // const flattenedFileName = fileName.split(".")[0] + "_flattened.sol";
  // sources[flattenedFileName] = { content: flattenedCode };

  //upload contract data to an ipfs directory
  const uploadResult: UploadResult = await uploadToIpfs(sources, JSON.stringify(abi), bytecode, JSON.stringify(StandardJsonInput));
  if (!uploadResult.cid) {
    const error = uploadResult.error;
    console.log(error);
  }

  const ipfsUrl = `https://nftstorage.link/ipfs/${uploadResult?.cid}`;

  async function verifyContract(address: string, standardJsonInput: string, compilerVersion: string, constructorArguments: string) {
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
    try {
      const params = new URLSearchParams();
      params.append('apikey', ETHERSCAN_API_KEY);
      params.append('module', 'contract');
      params.append('action', 'verifysourcecode');
      params.append('contractaddress', address);
      params.append('sourceCode', standardJsonInput);
      params.append('codeformat', 'solidity-standard-json-input');
      params.append('contractname', fileName + ':' + contractName);
      params.append('compilerversion', compilerVersion);
      params.append('optimizationused', '0');
      constructorArgs?.length && (
        params.append('constructorArguements', constructorArguments),
        console.log('Encoded args:', constructorArguments))
      params.append('evmversion', 'london'); // leave blank for compiler default
      const response = await axios.post('https://api-sepolia.etherscan.io/api', params);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }


  const transactionHash = await contractDeployment.deployTransaction.wait(3);
  if (transactionHash.status === 1 && chainData?.name === 'Sepolia') {
    verifyContract(contractAddress, JSON.stringify(StandardJsonInput), "v0.8.20+commit.a1b79de6", encodedConstructorArgs);
  }
  createContract({ name: fileName, address: contractAddress, chain, sourceCode });

  const deploymentData = { name: fileName, chain: chainData?.name, contractAddress, explorerUrl, ipfsUrl };
  console.log(`Deployment data: `, deploymentData);

  return deploymentData;
};
