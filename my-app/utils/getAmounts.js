import { ethers } from "ethers";
import TokenContract from "../contract/CryptoDevToken.json";
import Exchange from "../contract/Exchange.json";

/**
 * getEtherBalance : retrieves ether balance of user account / exchange contract
 */
async function getEtherBalance(provider, address, contract = false) {
  try {
    // If the caller has set the `contract` boolean to true, retrieve the balance of
    // ether in the `exchange contract`, if it is set to false, retrieve the balance
    // of the user's address
    if (contract) {
      const balance = await provider.getBalance(Exchange.address);
      return balance;
    } else {
      const balance = await provider.getBalance(address);
      return balance;
    }
  } catch (error) {
    console.log(error.message);
    window.alert(error.reason);
    return 0;
  }
}

/**
 * getCDTokensBalance: Retrieves the Crypto Dev tokens in the account
 * of the provided `address`
 */
async function getCDTokensBalance(provider, address) {
  try {
    const tokenContract = new ethers.Contract(
      TokenContract.address,
      TokenContract.abi,
      provider
    );
    const tokenBalance = await tokenContract.balanceOf(address);
    return tokenBalance;
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * getLPTokensBalance: Retrieves the amount of LP tokens in the account
 * of the provided `address`
 */
async function getLPTokensBalance(provider, address) {
  try {
    const exchangeContract = new ethers.Contract(
      Exchange.address,
      Exchange.abi,
      provider
    );
    const lpTokenBalance = await exchangeContract.balanceOf(address);
    return lpTokenBalance;
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * getReserveOfCDTokens: Retrieves the amount of CD tokens in the
 * exchange contract address
 */
async function getReserveOfCDTokens(provider) {
  try {
    const exchangeContract = new ethers.Contract(
      Exchange.address,
      Exchange.abi,
      provider
    );
    const reserveBal = await exchangeContract.getReserve();
    return reserveBal;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  getEtherBalance,
  getCDTokensBalance,
  getLPTokensBalance,
  getReserveOfCDTokens,
};
