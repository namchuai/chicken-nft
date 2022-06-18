require("dotenv").config();
const { BN } = require("bn.js");
const { ethers } = require("hardhat");

const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function approveSpender(spenderAddress, amount) {
  const abi = ["function approve(address, uint)"];

  const contract = new ethers.Contract(contractAddress, abi, ethers.provider);

  const nonce = await ethers.provider.getTransactionCount(PUBLIC_KEY);
  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);

  const transaction = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gasLimit: 500000,
    data: contract.interface.encodeFunctionData("approve", [
      spenderAddress,
      amount,
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

async function depositErc20(starkKey, assetType, vaultId, quantizedAmount) {
  if (!STARKEX_ADDRESS || !PUBLIC_KEY || !PRIVATE_KEY) {
    throw `Cannot get env var!`;
  }
  console.log(`DepositErc20 with quantizedAmount = ${quantizedAmount}`);
  const starkexRegisterAbi = ["function deposit(uint, uint, uint, uint)"];

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
    data: contract.interface.encodeFunctionData("deposit", [
      starkKey,
      assetType,
      vaultId,
      quantizedAmount,
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
const contractAddress = "0x90a34F988e9741faee79e0A5A036CAD480f38D51";
const starkKey =
  "0xada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c";
const assetType =
  "0x3c2760636dd81618622f7e57b1e9ae536d5fd696417a067767b02ddb7c1d452";
const vaultId = 22111994;
const amount = ethers.utils.parseEther("0.5").toString();
const amountBn = new BN(amount, 10);
const quantum = new BN("1000000000", 10);
const quantizedAmount = amountBn.div(quantum).toString(10);

// approveSpender(STARKEX_ADDRESS, amountBn.toString(10));
depositErc20(starkKey, assetType, vaultId, quantizedAmount);
