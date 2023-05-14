import { ethers } from "ethers";
import chains from "@/lib/chains.json";

const estimateGasOnMainnet = async (simulateTx: any) => {
  const mainnetProvider = new ethers.providers.JsonRpcProvider(chains[1].rpc[0], chains[1].chainId);
  const estimatedGas = await mainnetProvider.estimateGas(simulateTx);
  return estimatedGas;
};

export default estimateGasOnMainnet;
