const { ethers } = require("hardhat")

// Exchange Contract Address(sepolia) : 0x4B32Aeb190D71d0bdEed2131f615501EED63b212

const CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS =
    "0x27598FfF1F7a70660bc00daaD8740022beB66119"

async function main() {
    const ExchangeFactory = await ethers.getContractFactory("Exchange")
    console.log("Deploying Contract")
    const Exchange = await ExchangeFactory.deploy(
        CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS
    )
    await Exchange.deployed()
    console.log(`Exchange Contract Deployed at : ${Exchange.address}`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
