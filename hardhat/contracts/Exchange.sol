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

        // initial case
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

    /**
     * When removing liquidity user will get ETH and CryptoDev Token.
     * This function returns the amount of both of these.
     */
    function removeLiquidity(
        uint256 _lpTokenAmt
    ) public returns (uint256, uint256) {
        require(_lpTokenAmt > 0, "LP Token amount should be greater than zero");
        uint256 ethReserve = address(this).balance;
        uint256 lpTokenSupply = totalSupply();

        /**
         *The amount of Eth that would be sent back to the user is based on a ratio
          Ratio is -> (Eth sent back to the user) / (current Eth reserve)
            = (amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
          Then by some maths -> (Eth sent back to the user)
            = (current Eth reserve * amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
         */

        uint256 ethAmtToUser = (ethReserve * _lpTokenAmt) / lpTokenSupply;

        /**
         *The amount of Crypto Dev token that would be sent back to the user is based on a ratio
          Ratio is -> (Crypto Dev sent back to the user) / (current Crypto Dev token reserve)
            = (amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
          Then by some maths -> (Crypto Dev sent back to the user)
            = (current Crypto Dev token reserve * amount of LP tokens that user wants to withdraw) / (total supply of LP tokens)
         */

        uint256 cryptoDevTokenAmtToUser = (getReserve() * _lpTokenAmt) /
            lpTokenSupply;

        // buring lp token
        _burn(msg.sender, _lpTokenAmt);

        // Transfering eth to user
        (bool sent, ) = payable(msg.sender).call{value: ethAmtToUser}("");
        require(sent, "Transaction Failed");

        // Transfering CryptoDev Token
        cryptoDevToken.transfer(msg.sender, cryptoDevTokenAmtToUser);

        return (ethAmtToUser, cryptoDevTokenAmtToUser);
    }
}
