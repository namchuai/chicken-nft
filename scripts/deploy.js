const { ethers } = require("hardhat");

async function main() {
  const ChickenNFT = await ethers.getContractFactory("ChickenNFT");

  const chickenNFT = await ChickenNFT.deploy();
  await chickenNFT.deployed();
  console.log("Contract deployed to address:", chickenNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })