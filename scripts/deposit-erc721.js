require("dotenv").config();
const { BN } = require("bn.js");
const { ethers } = require("hardhat");

const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function setApproval(operatorAddress) {
  const abi = ["function setApprovalForAll(address, bool)"];
  const contract = new ethers.Contract(STARKEX_ADDRESS, abi, ethers.provider);

  const nonce = await ethers.provider.getTransactionCount(PUBLIC_KEY);
  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

  const transaction = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gasLimit: 500000,
    data: contract.interface.encodeFunctionData("setApprovalForAll", [
      operatorAddress,
      true,
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

async function depositErc721(starkKey, assetType, vaultId, tokenId) {
  if (!STARKEX_ADDRESS || !PUBLIC_KEY || !PRIVATE_KEY) {
    throw `Cannot get env var!`;
  }

  const starkexRegisterAbi = ["function depositNft(uint, uint, uint, uint)"];

  const contract = new ethers.Contract(
    STARKEX_ADDRESS,
    starkexRegisterAbi,
    ethers.provider
  );

  const nonce = await ethers.provider.getTransactionCount(PUBLIC_KEY);
  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

  const transaction = {
    from: PUBLIC_KEY,
    to: STARKEX_ADDRESS,
    nonce: nonce,
    gasLimit: 500000,
    data: contract.interface.encodeFunctionData("depositNft", [
      starkKey,
      assetType,
      vaultId,
      tokenId,
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

/// Config
const contractAddress = "0xBb9E1741F5C5C6FBdad15301cb045894A1b15276";
const starkKey =
  "0xada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c";
const assetType =
  "0x286bc9c3a5cd7fa3588d2bde1de640b7352853a42d3f192182acd2c03c5159f";
const vaultId = 22111995;
const tokenId = "2";

// setApproval(STARKEX_ADDRESS);
depositErc721(starkKey, assetType, vaultId, tokenId);

