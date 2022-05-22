const { ethers } = require("hardhat");

async function main() {
  const ChickenNFT = await ethers.getContractFactory("MyriaAsset");

  const chickenNFT = await ChickenNFT.deploy("0x539E04652385A048E920FD98503afAf880A00f6C", "Myria team", "Myria", "0x539E04652385A048E920FD98503afAf880A00f6C");
  await chickenNFT.deployed();
  console.log("Contract deployed to address:", chickenNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })