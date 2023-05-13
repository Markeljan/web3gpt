export interface Contract {
  name: string;
  address: string;
  chain: string;
  sourceCode: string;
}

export type ChainData = {
  name: string;
  chain: string;
  icon: string;
  rpc: string[];
  features?: { name: string }[];
  faucets: any[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44: number;
  ens: {
    registry: string;
  };
  explorers: {
    name: string;
    url: string;
    standard: string;
  }[];
};
