import { Hex } from "viem";

export interface DeployContractConfig {
    chainName: string;
    contractName: string;
    sourceCode: string;
    constructorArgs: Array<string | string[]>;
}

export interface DeployContractResponse {
    contractAddress: Hex;
    explorerUrl: string;
    ipfsUrl: string;
}