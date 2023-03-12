import { ethers } from "ethers";
import Exchange from "../contract/Exchange.json";
import TokenContract from "../contract/CryptoDevToken.json";

async function addLiquidity(signer, addCDAmountWei, addEtherAmountWei) {
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

    // approving exchange contract so that it can withdraw token from user account.
    const tx = await tokenContract.approve(
      Exchange.address,
      addCDAmountWei.toString()
    );
    await tx.wait();

    const txn = await exchangeContract.addLiquidity(addCDAmountWei.toString(), {
      value: addCDAmountWei,
    });
    await txn.wait();
  } catch (error) {
    console.log(error.message);
  }
}

async function calculateCD(
  _addEther = "0",
  contractETHBalance,
  CDTokenReserve
) {
  try {
    const addEtherWei = ethers.utils.parseEther(_addEther);

    const cdTokenNeeded =
      CDTokenReserve.mul(addEtherWei).div(contractETHBalance);

    return cdTokenNeeded;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  addLiquidity,
  calculateCD,
};
