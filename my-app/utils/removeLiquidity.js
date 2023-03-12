import { ethers } from "ethers";
import Exchange from "../contract/Exchange.json";

async function removeLiquidity(removeLPTokensWei, signer) {
  try {
    const exchangeContract = new ethers.Contract(
      Exchange.address,
      Exchange.abi,
      signer
    );

    const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
    await tx.wait();
  } catch (error) {
    console.log(error.message);
  }
}

async function getTokensAfterRemove(
  provider,
  removeLPTokenWei,
  _ethBalance,
  cryptoDevTokenReserve
) {
  try {
    const exchangeContract = new ethers.Contract(
      Exchange.address,
      Exchange.abi,
      provider
    );

    // Get the total supply of `Crypto Dev` LP tokens
    const _totalSupply = await exchangeContract.totalSupply();

    const _removeEther = _ethBalance.mul(removeLPTokenWei).div(_totalSupply);
    const _removeCD = cryptoDevTokenReserve
      .mul(removeLPTokenWei)
      .div(_totalSupply);

    return {
      _removeEther,
      _removeCD,
    };
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  removeLiquidity,
  getTokensAfterRemove,
};
