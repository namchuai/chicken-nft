const starkwareCrypto = require("@starkware-industries/starkware-crypto-utils");
const { ethers } = require("hardhat");
const ethersjs = require("ethers");
const encUtils = require("enc-utils");
const BN = require("bn.js");
const Web3 = require("web3");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;

const wallet = new ethers.Wallet(PRIVATE_KEY);

const DEFAULT_MESSAGE = "StarkKeyDerivation";
const STARK_PUBLIC_KEY =
  "0xada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c";
const STARK_PRIVATE_KEY =
  "0x4ab630a6cd851cbdf5662d9f83da0c9a6932ac87ae0eb307025cb74a3928d1c";

const secondWalletAddress = "0xC774461219003a11cb3f8bef7D9AF705E42d692C";
const secondWalletPrivateKey =
  "22199ac78a202c025c4058939003c753045e2b66d5d78d08d4446503637ef10a";

// async function generateStarkKey(ethPrivateKey) {
//   const aWallet = new ethers.Wallet(ethPrivateKey);
//   const message = DEFAULT_MESSAGE;
//   const signature = await aWallet.signMessage(message);
//   const starkPrivateKey =
//     starkwareCrypto.keyDerivation.getPrivateKeyFromEthSignature(signature);
//   const starkKey =
//     starkwareCrypto.keyDerivation.privateToStarkKey(starkPrivateKey);
//   console.log(starkKey);
// }

// generateStarkKey(PRIVATE_KEY);

async function getStarkKey() {
  const message = DEFAULT_MESSAGE;
  const signature = await wallet.signMessage(message);
  const starkPrivateKey =
    starkwareCrypto.keyDerivation.getPrivateKeyFromEthSignature(signature);
  const keyPair = starkwareCrypto.ec.keyFromPrivate(starkPrivateKey);
  const starkKey =
    starkwareCrypto.keyDerivation.privateToStarkKey(starkPrivateKey);
  // console.log(starkKey);

  // Register
  const registerMessage = "UserRegistration:";
  const starkKeyBigNumber = new BN(starkKey, 16);

  const test = ethers.utils.solidityKeccak256(
    ["string", "address", "uint256"],
    [registerMessage, PUBLIC_KEY, 3]
  );
  console.log(test);
  // const bn = (new BN(test.substring(2), 16).toArray("be")) % 3;
  // console.log(bn);

  // const encodedData = abiCoder.encode(
  //   ["string", "address", "uint256"],
  //   [registerMessage, PUBLIC_KEY, starkKey]
  // );
  // console.log(encodedData);
  // const msgHash = Web3.utils.soliditySha3(
  //   Web3.eth.abi.encodeParameters(
  //     ["string", "address", "uint256"],
  //     [registerMessage, PUBLIC_KEY, starkKey]
  //   )
  // );
  // console.log(msgHash);

  const r = signature.slice(0, 66).substring(2);
  const rInBytes = new BN(r, 16).toArray("be", 32);

  // testing
  // const keyPair = starkwareCrypto.ec.keyFromPrivate(starkPrivateKey);
  // const publicKey = starkwareCrypto.ec.keyFromPublic(
  //   keyPair.getPublic(true, "hex"),
  //   "hex"
  // );
  // console.log(publicKey);
  const publicKeyY = keyPair.getPublic().getY();
  const publicKeyBytes = publicKeyY.toArray("be", 32);
  //console.log(publicKeyY.toArray("be", 32));

  // console.log(rInBytes + publicKeyBytes);
}

// getStarkKey();

async function userRegistration(ethAddress, starkPublicKey) {
  const message = `UserRegistration:${ethAddress}${starkPublicKey}`;
  const signature = await wallet.signMessage(message);

  // console.log(signature);
  // return;
  // To get r,s,v
  //   const r = signature.slice(0, 66);
  //   const s = "0x" + signature.slice(66, 130);
  //   const v = "0x" + signature.slice(130, 132);
  //   console.log(`r: ${r}`);
  //   console.log(`s: ${s}`);
  //   console.log(`v: ${v}`);
  const starkSignature = await starkwareCrypto.sign(
    STARK_PRIVATE_KEY,
    signature
  );
  const starkexRegisterAbi = [
    "function registerEthAddress(address, uint, bytes)",
  ];

  const provider = new ethersjs.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/aaf4759d85734f41a84aee6caeb3e8e5"
  );
  const contract = new ethersjs.Contract(
    STARKEX_ADDRESS,
    starkexRegisterAbi,
    provider
  );
  const nonce = await provider.getTransactionCount(PUBLIC_KEY);
  const wallet2 = new ethersjs.Wallet(PRIVATE_KEY, provider);

  const transaction = {
    from: PUBLIC_KEY,
    to: STARKEX_ADDRESS,
    nonce: nonce,
    gasLimit: 500000,
    data: contract.interface.encodeFunctionData("registerEthAddress", [
      ethAddress,
      starkPublicKey,
      ethers.utils.toUtf8Bytes(starkSignature),
    ]),
  };
  wallet2
    .sendTransaction(transaction)
    .then((response) => {
      console.log("Success:", response);
    })
    .catch((err) => {
      console.log("Promise failed:", err);
    });
}

//userRegistration(PUBLIC_KEY, STARK_PUBLIC_KEY);
