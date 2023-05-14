const solc = require("solc");
import { findBestMatch } from "string-similarity";
import { ethers } from "ethers";
import chains from "@/lib/chains.json";
import { ChainData, Contract, DeployResults } from "@/lib/types";

type ContractsType = Contract[];

let contracts: ContractsType = [];

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
  sourceCode: string
): Promise<DeployResults> => {
  // get the chain object from the chains.json file. Direct match || partial match
  const chainData = <ChainData>(chains.find(
    (item) => item.name.toLowerCase() === chain.toLowerCase()
  ) ||
    findBestMatch(
      chain.toLowerCase(),
      chains.map((item) => item.name.toLowerCase())
    ).bestMatch.target);

  if (!chainData) {
    const error = new Error(`Chain ${chain} not found`);
    console.log(error);
    throw error;
  }

  const fileName = (name ? name.replace(/[^a-z0-9]/gi, "_").toLowerCase() : "contract") + ".sol";

  // Compile the contract
  const input = {
    language: "Solidity",
    sources: {
      [fileName]: {
        content: sourceCode,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    // Filter out warnings
    const errors = output.errors.filter(
      (error: { severity: string }) => error.severity === "error"
    );
    if (errors.length > 0) {
      const error = new Error(errors[0].formattedMessage);
      console.log(error);
      throw error;
    }
  }
  const contract = output.contracts[fileName];

  // Get the contract ABI and bytecode
  const contractName = Object.keys(contract)[0];
  const abi = contract[contractName].abi;
  const bytecode = contract[contractName].evm.bytecode.object;
  console.log("Compilation OK");

  // Prepare network, signer, and contract instance
  const rpcUrl: string = chainData.rpc[0].replace(
    "${INFURA_API_KEY}",
    process.env.INFURA_API_KEY || ""
  );

  const provider =
    rpcUrl && chainData.chainId
      ? new ethers.JsonRpcProvider(chainData.rpc[0], chainData.chainId)
      : ethers.getDefaultProvider(chainData.chainId);
  if (!(await provider.getNetwork())?.chainId) {
    const error = new Error(`Provider for chain ${chainData.name} not available`);
    console.log(error);
    throw error;
  }
  console.log(`Provider for chain ${chainData.name} OK`);

  const signer = new ethers.Wallet("0x" + process.env.PRIVATE_KEY, provider);
  if (!(await signer.getAddress())) {
    const error = new Error(`Signer for chain ${chainData.name} not available`);
    console.log(error);
    throw error;
  }
  console.log(`Signer for chain ${chainData.name} OK`);

  const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);

  // Gas estimation TODO: dynamic gasLimit estimation
  // const EIP1559 = chainData.features?.find((item) => item.name === "EIP1559") ? true : false;
  // const gasFeeData = await provider.getFeeData();
  // const gasOptions = EIP1559
  //   ? {
  //       maxFeePerGas: gasFeeData.maxFeePerGas,
  //       maxPriorityFeePerGas: gasFeeData.maxPriorityFeePerGas,
  //     }
  //   : { gasPrice: gasFeeData.gasPrice };

  const estimatedGas = 7000000n;

  // Deploy the contract
  const contractDeployment = await ContractFactory.deploy({
    gasLimit: estimatedGas,
    //gasOptions,
  });
  const deployTx = await contractDeployment.deploymentTransaction();
  const { contractAddress } = (await deployTx?.wait()) || {};

  if (!contractAddress) {
    const error = new Error("Contract deployment failed");
    console.log(error);
    throw error;
  }
  createContract({ name, address: contractAddress, chain, sourceCode });

  const explorerUrl = `${chainData?.explorers?.[0].url}/address/${contractAddress}`;

  const deploymentData = { name, chain, contractAddress, explorerUrl };
  console.log(`Deployment data: `, deploymentData);
  return deploymentData;
};
