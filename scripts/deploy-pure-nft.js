const { ethers } = require("hardhat");

async function main() {
  const contractFactory = await ethers.getContractFactory("PureNFT");

  const contract = await contractFactory.deploy("https://google.com");
  await contract.deployed();
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
