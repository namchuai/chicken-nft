const { ethers } = require("hardhat");

const OWNER_ACCOUNT_ADDRESS = process.env.PUBLIC_KEY;
const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;

// Deployed: 0x2a4745A2662c855Dc4434805Aaff088042D36575

async function main() {
  const contractFactory = await ethers.getContractFactory("ChickenKoin");

  const chickenNFT = await contractFactory.deploy(
    OWNER_ACCOUNT_ADDRESS,
    "ChickenKoin1",
    "CK",
    STARKEX_ADDRESS
  );
  await chickenNFT.deployed();
  console.log("Contract deployed to address:", chickenNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
