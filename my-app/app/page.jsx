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
  const [addEther, setAddEther] = useState("0");
  const [lpBalance, setLPBalance] = useState("0");
  const [reservedCD, setReservedCD] = useState("0");
  const [etherBalanceContract, setEtherBalanceContract] = useState("0");
  const [display, setDisplay] = useState(false);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const zero = ethers.BigNumber.from(0);
  const web3modalRef = useRef();
  const [removeLPTokens, setRemoveLPTokens] = useState("0");
  const [removeEther, setRemoveEther] = useState("0");
  const [removeCD, setRemoveCD] = useState("0");
  const [swapAmount, setSwapAmount] = useState("0");
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
  useState("0");
  const [ethSelected, setEthSelected] = useState(true);
  

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

  async function _addLiquidity () {
    try {
      const addEtherWei = ethers.utils.parseEther(addEther.toString());
      const addCDToken = ethers.utils.parseEther(addCDTokens.toString());

      if (!addEtherWei.eq(zero) && !addCDToken.eq(zero)) {
        const signer = await connectWallet();
        setLoading(true);
        await addLiquidity(signer, addCDToken, addEtherWei);
        setLoading(false);
        setAddCDTokens("0");
        await getAmounts(signer);
      } else {
        setAddCDTokens("0");
        window.alert("You need to add both values");
      }
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      setAddCDTokens("0");
    }
  }

  async function _removeLiquidity() {
    try {
      const signer = await connectWallet();
      const removeLPTokensWei = ethers.utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(removeLPTokensWei, signer);
      setLoading(false);
      await getAmounts(signer);
      setRemoveCD("0");
      setRemoveEther("0");
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      setRemoveCD("0");
      setRemoveEther("0");
    }
  }

  async function _getTokensAfterRemove(_removeLPTokens) {
    try {
      const signer = await connectWallet();
      const provider = signer.provider
      const removeLPTokenWei = ethers.utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEtherBalance(provider, null, true);
      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);
      const { _removeEther, _removeCD } = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        cryptoDevTokenReserve
      );
      setRemoveEther(ethers.utils.formatEther(_removeEther.toString()));
      setRemoveCD(ethers.utils.formatEther(_removeCD.toString()));
    } catch (error) {
      console.log(error.message);
    }
  }

  async function _getAmountOfTokensReceivedFromSwap (_swapAmount) {
    try {
      const swapAmountWei = ethers.utils.parseEther(_swapAmount.toString());
      if (!swapAmountWei.eq(zero)) {
        const signer = await connectWallet();
        const provider = signer.provider;
        const _ethBalance = await getEtherBalance(provider, null, true);
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          provider,
          swapAmountWei,
          ethSelected,
          _ethBalance,
          ethers.utils.parseEther(reservedCD)
        );
        settokenToBeReceivedAfterSwap(ethers.utils.formatEther(amountOfTokens.toString()));
      } else {
        settokenToBeReceivedAfterSwap("0");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  function renderButton() {
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (liquidityTab) {
      return (
        <div>
          <div>
            {reservedCD == "0.0" ? (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Amount of CryptoDev tokens"
                  onChange={(e) =>
                    setAddCDTokens(e.target.value || "0")
                  }
                  className={styles.input}
                />
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            ) : (<div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    const _addCDTokens = await calculateCD(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedCD
                    );
                    setAddCDTokens(ethers.utils.formatEther(_addCDTokens));
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  <span>{`You will need ${addCDTokens} Crypto Dev
                  Tokens`}</span>
                </div>
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
            </div>)}
            <div>
              <input
                type="number"
                placeholder="Amount of LP Tokens"
                onChange={async (e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
              <span>{`You will need ${removeCD} Crypto Dev
                  Tokens and ${removeEther} ETH` }</span>
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
        </div>

      )
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "0");
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
            }}
            className={styles.input}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              await _getAmountOfTokensReceivedFromSwap("0");
              setSwapAmount("0");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
          </select>
          <div className={styles.inputDiv}>
            {ethSelected
              ? `You will get ${
                  tokenToBeReceivedAfterSwap
                } Crypto Dev Tokens`
              : `You will get ${
                  tokenToBeReceivedAfterSwap
                } Eth`}
          </div>
          {/* <button className={styles.button1} onClick={_swapTokens}>
            Swap
          </button> */}
        </div>
      )
    }
  }

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
          {walletConnected && renderButton()}
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </main>
  );
}
