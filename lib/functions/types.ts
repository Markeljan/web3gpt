import { Chain, Hex } from "viem";

export interface DeployContractConfig {
    chainName: string;
    contractName: string;
    sourceCode: string;
    constructorArgs: Array<string | string[]>;
}

export interface DeployContractResponse {
    explorerUrl: string;
    ipfsUrl: string;
}

export type VerifyContractParams = {
    deployHash: Hex,
    standardJsonInput: string,
    encodedConstructorArgs: string,
    fileName: string,
    contractName: string,
    viemChain: Chain
}

export type VerifyContractRequestParams = {
    address: string,
    standardJsonInput: string,
    compilerVersion: string,
    encodedConstructorArgs: string,
    fileName: string,
    contractName: string,
    viemChain: Chain
}
