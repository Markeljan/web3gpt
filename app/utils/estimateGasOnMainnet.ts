import { ContractDeployTransaction, ethers } from "ethers";
import chains from "@/lib/chains.json";

const estimateGasOnMainnet = async (simulateTx: ContractDeployTransaction) => {
  const mainnetProvider = new ethers.JsonRpcProvider(chains[1].rpc[0], chains[1].chainId);
  const estimatedGas = await mainnetProvider.estimateGas(simulateTx);
  return estimatedGas;
};

export default estimateGasOnMainnet;
