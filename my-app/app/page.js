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
import Exchange from "../contract/Exchange.json";
import TokenContract from "../contract/CryptoDevToken.json";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [ethBalance, setEtherBalance] = useState("0");
  const [cdBalance, setCDBalance] = useState("0");
  const [addCDTokens, setAddCDTokens] = useState("0");
  const [lpBalance, setLPBalance] = useState("0");
  const [reservedCD, setReservedCD] = useState("0");
  const [etherBalanceContract, setEtherBalanceContract] = useState("0");
  const [display, setDisplay] = useState(false);

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
    setLoading(true);
    const signer = await connectWallet();
    await getAmounts(signer);
    setLoading(false);
    setDisplay(true);
  };

  const getAmounts = async (signer) => {
    try {
      const provider = await signer.provider;
      const accountAddress = await signer.getAddress();
      const _ethBalance = await getEtherBalance(provider, accountAddress);
      setEtherBalance(ethers.utils.formatEther(_ethBalance).toString());
      const _cdTokenBalance = await getCDTokensBalance(
        provider,
        accountAddress
      );
      setCDBalance(ethers.utils.formatEther(_cdTokenBalance).toString());

      // lpToken owned by the address
      const _lpTokenBalance = await getLPTokensBalance(
        provider,
        accountAddress
      );
      setLPBalance(ethers.utils.formatEther(_lpTokenBalance).toString());

      // CD Token owned by the contract
      const _reservedCD = await getReserveOfCDTokens(provider);
      setReservedCD(ethers.utils.formatEther(_reservedCD).toString());

      // contract ether balance
      const _contractEther = await getEtherBalance(provider, null, true);
      setEtherBalanceContract(
        ethers.utils.formatEther(_contractEther).toString()
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    web3modalRef.current = new Web3Modal({
      providerOptions: {},
      network: "goerli",
      disableInjectedProvider: false,
    });
  }, []);

  return (
    <main>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Crypto Dev Tokens
          </div>
          {!walletConnected ? (
            <button onClick={handleConnect} className={styles.button}>
              {loading ? <span>Connecting...</span> : <span>Connect</span>}
            </button>
          ) : (
            <div className={styles.container1}>
              <p>You have</p>
              <p>{ethBalance} Ether</p>
              <p>{cdBalance} CryptoDev Tokens</p>
              <p>{lpBalance} LP Token</p>
            </div>
          )}
          {display ? (
            <div className={styles.container2}>
              <button
                className={styles.button}
                onClick={() => {
                  setLiquidityTab(true);
                }}
              >
                Liquidity
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  setLiquidityTab(false);
                }}
              >
                Swap
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </main>
  );
}
