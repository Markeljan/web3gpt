"use client";
import { useEffect, useState } from "react";
import { GatewayProvider } from "@civic/ethereum-gateway-react";
import { ethers } from "ethers";
import App from "./app";

declare global {
  interface Window{
    ethereum?:any
  }
}

const Home = () => {
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setSigner(signer as any);
    } else {
      console.log('Please install MetaMask!');
    }
  }, []);

  return (
    signer ? (
      <GatewayProvider
        wallet={signer}
        gatekeeperNetwork="ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6">
          <App />
      </GatewayProvider>
    ) : (
      <div>Loading...</div>
    )
  );
}

export default Home;