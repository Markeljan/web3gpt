const solc = require("solc");
import { Networkish, ethers } from "ethers";
import chains from "./chains.json";

export interface Contract {
  address: string;
  chain: string;
  sourceCode: string;
  name?: string;
}

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
  chain: string,
  sourceCode: string,
  name?: string
): Promise<Contract> => {
  // get the chain object from the chains.json file
  const chainData = <Networkish>(
    chains.find((item) => item.name.toLowerCase() === chain.toLowerCase())
  );

  if (!chainData) {
    throw new Error("Chain not found");
  }

  // Compile the contract
  const input = {
    language: "Solidity",
    sources: {
      [name ? `${name}.sol` : "contract.sol"]: {
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
  const contract = output.contracts["contract.sol"];

  // Get the contract ABI and bytecode
  const contractName = Object.keys(contract)[0];
  const abi = contract[contractName].abi;
  const bytecode = contract[contractName].evm.bytecode.object;

  // Prepare network, signer, and contract instance
  const provider = ethers.getDefaultProvider(chainData);
  const signer = new ethers.Wallet("0x" + process.env.PRIVATE_KEY, provider);
  const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);

  // Deploy the contract
  const contractInstance = await ContractFactory.deploy();
  const deployTx = await contractInstance.deploymentTransaction();
  console.log("deployTransaction", deployTx);
  const deployedReceipt = await deployTx?.wait();
  console.log("receipt", deployedReceipt);

  const contractAddress = deployedReceipt?.contractAddress;

  if (!contractAddress) {
    throw new Error("Contract deployment failed");
  }
  createContract({ address: contractAddress, chain, sourceCode, name });

  return { address: contractAddress, chain, sourceCode, name };
};
