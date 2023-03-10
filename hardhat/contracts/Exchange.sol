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

    /**
     * @dev Returns the amount Eth/Crypto Dev tokens that would be returned to the user in the swap
     */
    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid Reserve");

        // We are applying a fee of 1% during swap
        // Input amount with fee = (input amount - (1*(input amount)/100)) = ((input amount)*99)/100
        // In the above formula, if 1 want to swap for 1 ETH , we will find 1% of 1 ETH and subtract it
        // from input given, and apply swap with this new value. Ie for 1 eth sent by the user we do swap for
        // only 0.99 ETH

        uint256 inputAmountAfterFees = inputAmount * 99; // here / 100 will be applied below formula

        // We need to make sure (x + Δx) * (y - Δy) = x * y
        // So the final formula is Δy = (y * Δx) / (x + Δx)

        uint256 numerator = outputReserve * inputAmountAfterFees;
        uint256 denominator = (inputReserve * 100) + inputAmountAfterFees;

        return numerator / denominator;
    }

    /**
     * @dev Swaps Eth for CryptoDev Tokens
     */
    function ethToCryptoDevToken(uint256 _minToken) public payable {
        uint256 tokenReserve = getReserve();
        uint256 inputAmount = msg.value;
        uint256 ethReserve = address(this).balance - inputAmount;

        uint256 tokensBought = getAmountOfTokens(
            inputAmount,
            ethReserve,
            tokenReserve
        );

        require(
            tokensBought >= _minToken,
            "Insufficient Amount of Token Bought"
        );

        // Transfer the `Crypto Dev` tokens to the user
        cryptoDevToken.transfer(msg.sender, tokensBought);
    }

    /**
     * @dev Swaps CryptoDev Tokens for Eth
     */
    function cryptoDevTokenToEth(
        uint256 _tokenSwapAmt,
        uint256 _minEth
    ) public {
        uint256 tokenReserve = getReserve();
        uint256 ethReserve = address(this).balance;

        uint256 ethBought = getAmountOfTokens(
            _tokenSwapAmt,
            tokenReserve,
            ethReserve
        );

        require(ethBought >= _minEth, "insufficient output amount");

        // Transfer `Crypto Dev` tokens from the user's address to the contract
        cryptoDevToken.transferFrom(msg.sender, address(this), _tokenSwapAmt);

        // Sending ether to user
        (bool sent, ) = payable(msg.sender).call{value: ethBought}("");
        require(sent, "Transaction Failed");
    }
}
