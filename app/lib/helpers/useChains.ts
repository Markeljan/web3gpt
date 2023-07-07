import chains from "@/lib/chains.json";
import { ChainData } from "@/app/types/types";
import { findBestMatch } from "string-similarity";
import { Chain } from "viem";

export const API_URLS: Record<Chain["name"], string> = {
  'Ethereum': 'https://api.etherscan.io',
  'Goerli': 'https://api-goerli.etherscan.io',
  'Sepolia': 'https://api-sepolia.etherscan.io',
  'Arbitrum One': 'https://api.arbiscan.io',
  'Arbitrum Goerli': 'https://api-goerli.arbiscan.io',
  'Polygon Mainnet': 'https://api.polygonscan.com',
  'Mumbai': 'https://api-testnet.polygonscan.com',
  'Optimism': 'https://api-optimistic.etherscan.io',
  'Optimism Goerli Testnet': 'https://api-goerli.optimistic.etherscan.io',
}

export const API_KEYS: Record<Chain["name"], string | undefined> = {
  'Ethereum': process.env.ETHERSCAN_API_KEY,
  'Goerli': process.env.ETHERSCAN_API_KEY,
  'Sepolia': process.env.ETHERSCAN_API_KEY,
  'Arbitrum One': process.env.ARBISCAN_API_KEY,
  'Arbitrum Goerli': process.env.ARBISCAN_API_KEY,
  'Polygon Mainnet': process.env.POLYGONSCAN_API_KEY,
  'Mumbai': process.env.POLYGONSCAN_API_KEY,
  'Optimism': process.env.OPTIMISM_API_KEY,
  'Optimism Goerli Testnet': process.env.OPTIMISM_API_KEY,
}


export const getChainMatch = (chain: string): Chain | undefined => {
  // get the chain object from the chains.json file. Direct match || partial match
  const findAttempt = chains.find((item) => item.name.toLowerCase() === chain.toLowerCase());

  const matchedChain: ChainData = findAttempt?.chainId
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

  const viemChain: Chain | undefined = {
    id: matchedChain.chainId,
    name: matchedChain.name,
    network: matchedChain.name.toLowerCase(),
    nativeCurrency: {
      name: matchedChain.nativeCurrency.name,
      symbol: matchedChain.nativeCurrency.symbol,
      decimals: matchedChain.nativeCurrency.decimals,
    },
    rpcUrls: {
      public: { http: matchedChain.rpc },
      default: { http: matchedChain.rpc },
    },
    blockExplorers: matchedChain.explorers && {
      etherscan: {
        name: matchedChain.explorers[0].name,
        url: matchedChain.explorers[0].url,
      },
      default: {
        name: matchedChain.explorers[0].name,
        url: matchedChain.explorers[0].url,
      },
    },
  };

  return viemChain;
};

export const getRpcUrl = (viemChain: Chain): string | undefined => {
  const rpcUrl: string = viemChain?.rpcUrls.default.http[0]?.replace(
    "${INFURA_API_KEY}",
    process.env.INFURA_API_KEY || ""
  );
  return rpcUrl;
}

export const getExplorerUrl = (viemChain: Chain): string | undefined => {
  return viemChain?.blockExplorers?.default.url;
}