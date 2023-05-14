const solc = require("solc");
import { findBestMatch } from "string-similarity";
import { BigNumber, ethers } from "ethers";
import chains from "@/lib/chains.json";
import { ChainData, Contract, DeployResults } from "@/lib/types";
import { formatUnits } from "ethers/lib/utils";

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
    }
  }
  const contract = output.contracts[fileName];

  // Get the contract ABI and bytecode
  const contractName = Object.keys(contract)[0];
  const abi = contract[contractName].abi;
  const bytecode = contract[contractName].evm.bytecode.object;

  // Prepare network, signer, and contract instance
  const rpcUrl: string = chainData?.rpc?.[0]?.replace(
    "${INFURA_API_KEY}",
    process.env.INFURA_API_KEY || ""
  );

  const provider =
    rpcUrl && chainData.chainId
      ? new ethers.providers.JsonRpcProvider(chainData.rpc[0], chainData.chainId)
      : ethers.getDefaultProvider(chainData.chainId);
  if (!(await provider.getNetwork())?.chainId) {
    const error = new Error(`Provider for chain ${chainData.name} not available`);
    console.log(error);
  }
  console.log(`Provider for chain ${chainData.name} OK`);

  const signer = new ethers.Wallet("0x" + process.env.PRIVATE_KEY, provider);
  if (!(await signer.getAddress())) {
    const error = new Error(`Signer for chain ${chainData.name} not available`);
    console.log(error);
  }
  console.log(`Signer for chain ${chainData.name} OK`);

  const estimatedGas = BigNumber.from("7000000");
  // Gas estimation TODO: dynamic gasLimit estimation

  const gasFeeData = await provider.getFeeData();
  const EIP1559 =
    !gasFeeData?.maxFeePerGas?._hex || gasFeeData?.maxFeePerGas?._hex === "0x0" ? false : true;
  const gasPrice = gasFeeData?.gasPrice;
  const maxFeePerGas = gasFeeData?.maxFeePerGas;
  const maxPriorityFeePerGas = gasFeeData?.maxPriorityFeePerGas;

  function buildGasOptions() {
    const gasOptions: any = {
      gasLimit: estimatedGas,
    };
    if (!EIP1559) {
      gasOptions["gasPrice"] = gasPrice;
    } else {
      if (Number(maxFeePerGas) > 0) {
        gasOptions["maxFeePerGas"] = maxFeePerGas;
      }
      if (Number(maxPriorityFeePerGas) > 0) {
        gasOptions["maxPriorityFeePerGas"] = maxPriorityFeePerGas;
      }
    }
    return gasOptions;
  }

  // Deploy the contract
  const gasOptions = await buildGasOptions();
  console.log({
    chain,
    maxFeePerGas,
    EIP1559,
    gasOptions,
  });
  const factory = await new ethers.ContractFactory(abi, bytecode, signer);
  console.log(`Contract factory for chain ${chainData.name} OK`);

  const contractDeployment = await factory.getDeployTransaction(gasOptions);
  console.log(`Contract deployment gas estimation for chain ${chainData.name} OK`);
  const deploymentResponse = await signer.sendTransaction({
    ...contractDeployment,
    ...gasOptions,
  });
  console.log("Deployment transaction sent. Waiting for confirmation...");

  // Wait for the contract deployment transaction to be mined
  console.log("Deployment in progress...");
  const receipt = await deploymentResponse.wait();
  if (receipt.status !== 1) {
    const error = new Error("Contract deployment failed");
    console.log(error);
  }
  const contractAddress = receipt.contractAddress;

  console.log(`Contract deployment for chain ${chainData.name} OK`);
  if (!contractAddress) {
    const error = new Error("Contract deployment failed");
    console.log(error);
  }
  createContract({ name, address: contractAddress, chain, sourceCode });

  const explorerUrl = `${chainData?.explorers?.[0].url}/address/${contractAddress}`;

  const deploymentData = { name, chain, contractAddress, explorerUrl };
  console.log(`Deployment data: `, deploymentData);
  return deploymentData;
};
