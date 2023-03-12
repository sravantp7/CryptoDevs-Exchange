import { ethers } from "ethers";
import Exchange from "../contract/Exchange.json";
import TokenContract from "../contract/CryptoDevToken.json";

async function getAmountOfTokensReceivedFromSwap(
  signer,
  swapAmount,
  ethSelected,
  ethBalance,
  reservedCD
) {
  try {
    const exchangeContract = new ethers.Contract(
      Exchange.address,
      Exchange.abi,
      signer
    );

    let amountOfToken;
    if (ethSelected) {
      amountOfToken = await exchangeContract.getAmountOfTokens(
        swapAmount,
        ethBalance,
        reservedCD
      );
    } else {
      amountOfToken = await exchangeContract.getAmountOfTokens(
        swapAmount,
        reservedCD,
        ethBalance
      );
    }
    return amountOfToken;
  } catch (error) {
    console.log(error.message);
  }
}

async function swapTokens(
  signer,
  swapAmount,
  tokenToBeReceivedAfterSwap,
  ethSelected
) {
  try {
    const exchangeContract = new ethers.Contract(
      Exchange.address,
      Exchange.abi,
      signer
    );
    const tokenContract = new ethers.Contract(
      TokenContract.address,
      TokenContract.abi,
      signer
    );

    let tx;
    if (ethSelected) {
      tx = await exchangeContract.ethToCryptoDevToken(
        tokenToBeReceivedAfterSwap,
        { value: swapAmount }
      );
    } else {
      tx = await tokenContract.approve(Exchange.address, swapAmount.toString());
      await tx.wait();
      tx = await exchangeContract.cryptoDevTokenToEth(
        swapAmount,
        tokenToBeReceivedAfterSwap
      );
    }
    await tx.wait();
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  swapTokens,
  getAmountOfTokensReceivedFromSwap,
};
