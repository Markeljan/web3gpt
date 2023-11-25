"use client";

import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { arbitrumGoerli, baseGoerli, goerli, lineaTestnet, polygonMumbai, sepolia } from "wagmi/chains";
import { useTheme } from "next-themes";

const config = createConfig(
  getDefaultConfig({
    chains: [baseGoerli, polygonMumbai, goerli, sepolia, lineaTestnet, arbitrumGoerli,],

    // Required API Keys
    alchemyId: `${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    walletConnectProjectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,
    // Required
    appName: "Web3 GPT",
    // Optional
    appDescription: "Generate and deploy smart contracts with AI.",
    appUrl: `https://w3gpt.ai`,
    appIcon: "/favicon.png",
  }),
);


export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider mode={resolvedTheme === 'dark' ? 'dark' : 'light'} theme='auto'>
        {children}
      </ConnectKitProvider>
    </WagmiConfig>
  )

}
