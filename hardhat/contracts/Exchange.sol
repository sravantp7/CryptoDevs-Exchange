// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;
    ERC20 public cryptoDevToken;

    constructor(
        address _cryptoDevTokenAddress
    ) ERC20("CryptoDev LP Token", "CDLP") {
        require(_cryptoDevTokenAddress != address(0), "Null Address");
        cryptoDevTokenAddress = _cryptoDevTokenAddress;
        cryptoDevToken = ERC20(_cryptoDevTokenAddress);
    }

    /**
     * Returns the amount of 'CryptoDevs Token' held by this contract.
     */
    function getReserve() public view returns (uint256) {
        return cryptoDevToken.balanceOf(address(this));
    }

    /**
     * Add Liquidity
     */
    function addLiquidity(
        uint256 _cryptoDevTokenAmt
    ) public payable returns (uint256) {
        uint256 cryptoDevTokenReserve = getReserve(); // retrive tokens owned by the contract
        uint256 ethBalance = address(this).balance;
        uint liquidity;

        if (cryptoDevTokenReserve == 0) {
            cryptoDevToken.transferFrom(
                msg.sender,
                address(this),
                _cryptoDevTokenAmt
            );

            liquidity = ethBalance;
            _mint(msg.sender, liquidity); // mint cryptodevs LP token to liquidity provider
        } else {
            uint256 ethReserve = ethBalance - msg.value;

            //(cryptoDevTokenAmount user can add) = (Eth Sent by the user * cryptoDevTokenReserve /Eth Reserve);
            uint256 cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) /
                ethReserve;
            require(
                _cryptoDevTokenAmt >= cryptoDevTokenAmount,
                "Amount of tokens sent is less than the minimum tokens required"
            );
            cryptoDevToken.transferFrom(
                msg.sender,
                address(this),
                cryptoDevTokenAmount
            );

            // (LP tokens to be sent to the user (liquidity)/ totalSupply of LP tokens in contract) = (Eth sent by the user)/(Eth reserve in the contract)
            // by some maths -> liquidity =  (totalSupply of LP tokens in contract * (Eth sent by the user))/(Eth reserve in the contract)
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }
}
