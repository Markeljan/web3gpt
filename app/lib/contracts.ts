const solc = require("solc");
import { findBestMatch } from "string-similarity";
import chains from "@/lib/chains.json";
import { ChainData, Contract, DeployResults } from "@/app/types/types";
import uploadToIpfs, { UploadResult } from '@/lib/uploadToIpfs';
import handleImports from "@/lib/handleImports";
import { flattenSolidity } from "./flattener";
import { Chain, EncodeDeployDataParameters, createPublicClient, createWalletClient, encodeDeployData, http } from "viem";
import { privateKeyToAccount } from 'viem/accounts'
import { getChainMatch, getExplorerUrl, getRpcUrl } from "@/app/lib/helpers/useChains";

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

export const deployContract = async (
  name: string,
  chain: string,
  sourceCode: string,
  constructorArgs: Array<string | string[]>
): Promise<DeployResults> => {
  const viemChain: Chain | undefined = getChainMatch(chain);
  if (!viemChain) {
    throw new Error("Chain not found");
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
  let bytecode = contract[contractName].evm.bytecode.object;
  if (!bytecode.startsWith('0x')) {
    bytecode = '0x' + bytecode;
  }

  const rpcUrl = getRpcUrl(viemChain);

  //Prepare provider and signer
  const publicClient = createPublicClient({
    chain: viemChain,
    transport: rpcUrl ? http(rpcUrl) : http()
  })

  if (!(await publicClient.getChainId())) {
    const error = new Error(`Provider for chain ${viemChain.name} not available`);
    console.log(error);
  }
  console.log("Provider OK");

  const account = privateKeyToAccount('0x' + process.env.PRIVATE_KEY as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: viemChain,
    transport: rpcUrl ? http(rpcUrl) : http()
  })

  if (!(await walletClient.getAddresses())) {
    const error = new Error(`Wallet for chain ${viemChain.name} not available`);
    console.log(error);
  }
  console.log("Wallet OK");

  const deployData = encodeDeployData({
    abi: abi,
    bytecode: bytecode,
    args: constructorArgs || [],
  });
  console.log("Building deployData OK.")

  const deployHash = await walletClient.deployContract({
    abi: abi,
    bytecode: bytecode,
    account: account,
    args: constructorArgs || [],
  });

  console.log("Contract deployment OK");
  const explorerUrl = `${getExplorerUrl(viemChain)}/tx/${deployHash}`;

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

  async function verifyContract(address: `0x${string}`, standardJsonInput: string, compilerVersion: string, encodedConstructorArgs: string) {
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
        params.append('constructorArguements', encodedConstructorArgs))
      params.append('evmversion', 'london'); // leave blank for compiler default
      const response = await fetch('https://api-sepolia.etherscan.io/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams(params).toString()
      });
      const result = await response.json();
      console.log("Verification Response: ", result);
    } catch (error) {
      console.error(error);
    }
  }
  console.log("Waiting for deployment transaction confirmations...")

  let deployReceipt;
  console.log("Chain ID: ", viemChain?.id)
  if (viemChain?.id === 11155111) {
    const encodedConstructorArgs = deployData.slice(bytecode?.length);
    deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash, confirmations: 4 })
    if (deployReceipt.status === "success" && deployReceipt.contractAddress) {
      await verifyContract(deployReceipt.contractAddress, JSON.stringify(StandardJsonInput), "v0.8.20+commit.a1b79de6", encodedConstructorArgs);
    }
  } else {
    deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash, confirmations: 1 })
  }
  const contractAddress = deployReceipt?.contractAddress || '0x';

  const deploymentData = { name: fileName, chain: viemChain?.name, contractAddress, explorerUrl, ipfsUrl };

  console.log(`Deployment data: `, deploymentData);

  return deploymentData;
};
