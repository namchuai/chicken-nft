require("dotenv").config();
const { BN } = require("bn.js");
const { ethers } = require("hardhat");

const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function mintAnErc721(recipientAddress) {
  if (!STARKEX_ADDRESS || !PUBLIC_KEY || !PRIVATE_KEY) {
    throw `Cannot get env var!`;
  }
  const abi = ["function awardItem(address)"];

  const contract = new ethers.Contract(contractAddress, abi, ethers.provider);

  const nonce = await ethers.provider.getTransactionCount(PUBLIC_KEY);
  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

  const transaction = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gasLimit: 500000,
    data: contract.interface.encodeFunctionData("awardItem", [
      recipientAddress,
    ]),
  };
  wallet
    .sendTransaction(transaction)
    .then((response) => {
      console.log("Success:", response);
    })
    .catch((err) => {
      console.log("Promise failed:", err);
    });
}

const contractAddress = "0xBb9E1741F5C5C6FBdad15301cb045894A1b15276";

mintAnErc721(PUBLIC_KEY);
