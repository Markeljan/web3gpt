"use client";
import { useEffect, useState } from "react";
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
  const [signer, setSigner] = useState(null);
  const openWallet = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      openWallet();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setSigner(signer as any);
      //eth get accounts to open metamask
    } else {
      console.log('Please install MetaMask or XDC Pay and switch to the XDC Apothem Network.');
    }
  }, [window?.ethereum]);

  return (
    signer ? (
      <GatewayProvider
        wallet={signer}
        gatekeeperNetwork="ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6">
          <App />
      </GatewayProvider>
    ) : (
      <Typography>Metamask or XDC Pay connected to XDC Apothem Network required.</Typography>
    )
  );
}

export default Home;