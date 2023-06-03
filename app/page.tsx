"use client";
import { useCallback, useEffect, useState } from "react";
import { GatewayProvider } from "@civic/ethereum-gateway-react";
import { ethers } from "ethers";
import App from "./app";
import { Typography } from "@mui/material";

declare global {
  interface Window{
    ethereum?:any | undefined;
  }
}

const Home = () => {
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);

  const openWallet = useCallback(async () => {
    if (window?.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (err) {
        console.error('Failed to request accounts:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window?.ethereum !== "undefined") {
      openWallet();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        const signer = provider.getSigner();
        setSigner(signer);
      } catch (err) {
        console.error('Failed to get signer:', err);
      }
    } else {
      console.log('Please install MetaMask or XDC Pay and switch to the XDC Apothem Network.');
    }
  }, [openWallet]);

  return (
    signer ? (
      <GatewayProvider
        wallet={signer as any}
        gatekeeperNetwork="ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6">
          <App />
      </GatewayProvider>
    ) : (
      <Typography>Metamask or XDC Pay connected to XDC Apothem Network required.</Typography>
    )
  );
}

export default Home;
