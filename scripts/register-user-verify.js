require("dotenv").config();
const { ethers } = require("hardhat");

const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;

async function getContractInfo() {
  const contract = new ethers.Contract(
    STARKEX_ADDRESS,
    ["function getEthKey(uint) public view returns (address)"],
    ethers.provider
  );

  const registeredEthAddress = await contract.getEthKey(
    "0xada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c"
  );

  console.log(`registeredEthAddress: ${registeredEthAddress}`);
}

getContractInfo();
