const starkwareCrypto = require("@starkware-industries/starkware-crypto-utils");
const { ethers } = require("hardhat");
const BN = require("bn.js");

// Const
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;
const STARK_KEY_DERIVATION = "StarkKeyDerivation";
const ECDSA_EC_ORDER =
  "3618502788666131213697322783095070105526743751716087489154079457884512865583";

function removeHexPrefix(input) {
  if (input.substring(0, 2) === "0x") {
    return input.substring(2);
  }
  return input;
}

async function getStarkKey(ethPrivateKey) {
  const wallet = new ethers.Wallet(ethPrivateKey);
  const signature = await wallet.signMessage(STARK_KEY_DERIVATION);
  const starkPrivateKey =
    starkwareCrypto.keyDerivation.getPrivateKeyFromEthSignature(signature);
  const keyPair = starkwareCrypto.ec.keyFromPrivate(starkPrivateKey);
  const starkKey =
    starkwareCrypto.keyDerivation.privateToStarkKey(starkPrivateKey);

  return { keyPair, starkKey };
}

async function generateSignature(ethPrivateKey, ethPublicKey) {
  const { keyPair, starkKey } = await getStarkKey(ethPrivateKey);

  const registerMessage = "UserRegistration:";

  const msgHash = ethers.utils.solidityKeccak256(
    ["string", "address", "uint256"],
    [registerMessage, ethPublicKey, ethers.BigNumber.from(`0x${starkKey}`)]
  );

  const msgHashBn = new BN(removeHexPrefix(msgHash), 16);
  const msgHashMod = msgHashBn.mod(new BN(ECDSA_EC_ORDER, 10)).toJSON();

  const registerSignature = await starkwareCrypto.sign(keyPair, msgHashMod);

  const rByteArray = registerSignature.r.toArray("be", 32);
  const sByteArray = registerSignature.s.toArray("be", 32);
  const publicKeyYByteArray = keyPair.getPublic().getY().toArray("be", 32);

  const packedStarkSignature = [];
  for (const aByte of rByteArray) {
    packedStarkSignature.push(aByte);
  }
  for (const aByte of sByteArray) {
    packedStarkSignature.push(aByte);
  }
  for (const aByte of publicKeyYByteArray) {
    packedStarkSignature.push(aByte);
  }
  return {
    starkKey,
    packedStarkSignature,
  };
}

async function registerUser(ethPrivateKey, ethPublicKey) {
  const { starkKey, packedStarkSignature } = await generateSignature(
    ethPrivateKey,
    ethPublicKey
  );
  console.log(`Stark key: ${starkKey}`);
  console.log(`Signature length = ${packedStarkSignature.length}`);
  const starkexRegisterAbi = [
    "function registerEthAddress(address, uint, bytes)",
  ];

  const contract = new ethers.Contract(
    STARKEX_ADDRESS,
    starkexRegisterAbi,
    ethers.provider
  );
  const nonce = await ethers.provider.getTransactionCount(ethPublicKey);
  const wallet = new ethers.Wallet(ethPrivateKey, ethers.provider);

  const transaction = {
    from: ethPublicKey,
    to: STARKEX_ADDRESS,
    nonce: nonce,
    gasLimit: 10000000,
    data: contract.interface.encodeFunctionData("registerEthAddress", [
      ethPublicKey,
      ethers.BigNumber.from(`0x${starkKey}`),
      packedStarkSignature,
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

registerUser(PRIVATE_KEY, PUBLIC_KEY);
