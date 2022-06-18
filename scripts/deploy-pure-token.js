const { ethers } = require("hardhat");

async function main() {
  const contractFactory = await ethers.getContractFactory("PureToken");

  const contract = await contractFactory.deploy();
  await contract.deployed();
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
