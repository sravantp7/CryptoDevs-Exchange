"use client";

import styles from "./page.module.css";
import { ethers } from "ethers";
import { addLiquidity, calculateCD } from "@/utils/addLiquidity";
import {
  getEtherBalance,
  getCDTokensBalance,
  getLPTokensBalance,
  getReserveOfCDTokens,
} from "@/utils/getAmounts";
import { removeLiquidity, getTokensAfterRemove } from "@/utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "@/utils/swap";
import Web3Modal from "web3modal";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const web3modalRef = useRef();

  const connectWallet = async () => {
    try {
      const instance = await web3modalRef.current.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      setWalletConnected(true);
      return signer;
    } catch (error) {
      console.log(error.message);
      window.alert("User Rejected Connection");
    }
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  useEffect(() => {
    web3modalRef.current = new Web3Modal({
      providerOptions: {},
      network: "goerli",
      disableInjectedProvider: false,
    });
  }, []);

  return (
    <main className={styles.main}>
      <h1>DEX</h1>
      <button onClick={handleConnect} className={styles.button}>
        Connect
      </button>
    </main>
  );
}
