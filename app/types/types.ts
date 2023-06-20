export interface Contract {
  name: string;
  address: string;
  chain: string;
  sourceCode: string;
}

export interface DeployResults {
  name: string;
  chain: string;
  contractAddress: string;
  explorerUrl?: string;
  ipfsUrl?: string;
}

export type ChainData = {
  name: string;
  chain: string;
  icon?: string;
  rpc: string[];
  features?: { name: string }[];
  faucets: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44?: number;
  ens?: {
    registry: string;
  };
  explorers?: {
    name: string;
    url: string;
    standard?: string;
    icon?: string;
  }[];
};

export type ContractRequest = {
  type: "read" | "write";
  address: `0x${string}`;
  functionName: string;
  functionArgs: Array<string | string[]>;
}

export type PostRequestBody = {
  chain: string;
  requests: ContractRequest[];
}

export type ContractResponse = {
  status: 'success' | 'error';
  data?: any;  // Replace with the actual type of the data if known
  message?: string;
}

export type PostResponseData = ContractResponse[];
