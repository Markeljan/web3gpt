const solc = require("solc");
import { ethers } from "ethers";
import chains from "@/lib/chains.json";
import { ChainData, Contract } from "@/lib/types";

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
): Promise<Contract | Error> => {
  // get the chain object from the chains.json file
  const chainData = <ChainData>(
    chains.find((item) => item.name.toLowerCase() === chain.toLowerCase())
  );

  if (!chainData) {
    return new Error("Chain not found");
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
  const contract = output.contracts[fileName];

  // Get the contract ABI and bytecode
  const contractName = Object.keys(contract)[0];
  const abi = contract[contractName].abi;
  const bytecode = contract[contractName].evm.bytecode.object;
  console.log("Compiling contract OK");

  // Prepare network, signer, and contract instance
  const provider =
    chainData.rpc[0] && chainData.chainId
      ? new ethers.JsonRpcProvider(chainData.rpc[0], chainData.chainId)
      : ethers.getDefaultProvider(chainData.chainId);
  console.log("Provider OK");
  const signer = new ethers.Wallet("0x" + process.env.PRIVATE_KEY, provider);
  console.log("Signer OK");

  const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);

  // Gas estimation TODO: dynamic gas estimation based on the network
  const EIP1559 = chainData.features?.find((item) => item.name === "EIP1559") ? true : false;
  console.log("EIP1559:", EIP1559);
  const gasFeeData = await provider.getFeeData();
  console.log("Gas fee data: ", gasFeeData);
  const gasOptions = EIP1559
    ? {
        maxFeePerGas: gasFeeData.maxFeePerGas,
        maxPriorityFeePerGas: gasFeeData.maxPriorityFeePerGas,
      }
    : { gasPrice: gasFeeData.gasPrice };

  // const simulateTxLegacy = await ContractFactory.getDeployTransaction({
  //   ...gasOptionsLegacy,
  // });
  // const simulateTxEIP1559 = await ContractFactory.getDeployTransaction({
  //   ...gasOptionsEIP1559,
  // });

  console.log("SimulateTx OK");
  //const estimatedGas = await estimateGasOnMainnet(simulateTxEIP1559);
  const estimatedGas = 7000000n;

  // Deploy the contract
  const contractDeployment = await ContractFactory.deploy({
    gasLimit: estimatedGas,
    gasOptions,
  });
  console.log("Contract deployment OK");
  const deployTx = await contractDeployment.deploymentTransaction();
  console.log("DeployTx hash: ", deployTx?.hash);
  const deployedReceipt = await deployTx?.wait();
  const contractAddress = deployedReceipt?.contractAddress;
  console.log("Contract address: ", contractAddress);

  if (!contractAddress) {
    return new Error("Contract deployment failed");
  }
  createContract({ name, address: contractAddress, chain, sourceCode });

  return { name, address: contractAddress, chain, sourceCode };
};
