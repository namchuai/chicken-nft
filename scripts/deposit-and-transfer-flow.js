const starkwareCrypto = require("@starkware-industries/starkware-crypto-utils");
const StarkExAPI = require("@starkware-industries/starkex-js/dist/node");
const { ethers } = require("hardhat");

const starkExAPI = new StarkExAPI({
  endpoint: "https://gw.playground-v2.starkex.co",
});

async function deposit() {}

async function deriveStarkPrivateKey(ethPrivateKey) {
  const aWallet = new ethers.Wallet(ethPrivateKey);
  const message = "StarkKeyDerivation";
  const signature = await aWallet.signMessage(message);
  return starkwareCrypto.keyDerivation.getPrivateKeyFromEthSignature(signature);
}

function generateRandomStarkPrivateKey() {
  return randomHexString(63);
}

function randomString(characters, length) {
  let result = "";
  for (let i = 0; i < length; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function randomHexString(length, leading0x = false) {
  const result = randomString("0123456789ABCDEF", length);
  return leading0x ? "0x" + result : result;
}

async function transfer(
  amount,
  expirationTimestamp,
  nonce,
  receiverPublicKey,
  receiverVaultId,
  senderVaultId,
  ethPrivateKey,
  token
) {
  const transfer = {
    quantizedAmount: amount,
    expiration_timestamp: expirationTimestamp,
    nonce: nonce,
    receiverPublicKey: receiverPublicKey,
    receiverVaultId: receiverVaultId,
    senderVaultId: senderVaultId,
    token: token,
  };

  const senderPrivateKey = await deriveStarkPrivateKey(ethPrivateKey);
  //   const senderPrivateKey = generateRandomStarkPrivateKey();
  const keyPair = starkwareCrypto.ec.keyFromPrivate(senderPrivateKey, "hex");
  const senderPublicKey = keyPair.getPublic().encode("hex", true);

  const msgHash = starkwareCrypto.getTransferMsgHash(
    transfer.quantizedAmount,
    transfer.nonce,
    transfer.senderVaultId,
    transfer.token,
    transfer.receiverVaultId,
    transfer.receiverPublicKey,
    transfer.expiration_timestamp
  );

  const signature = await starkwareCrypto.sign(keyPair, msgHash);
  const r = `0x${signature.r.toJSON()}`;
  const s = `0x${signature.s.toJSON()}`;

  const transferTransaction = await prepareTransaction(
    amount,
    nonce,
    senderPublicKey,
    senderVaultId,
    token,
    receiverPublicKey,
    receiverVaultId,
    expirationTimestamp,
    r,
    s
  );

  await sendTransactionToGateway(transferTransaction);
}

async function prepareTransaction(
  amount,
  nonce,
  senderPublicKey,
  senderVaultId,
  token,
  receiverPublicKey,
  receiverVaultId,
  expirationTimestamp,
  r,
  s
) {
  const transactionId = await starkExAPI.gateway.getFirstUnusedTxId();

  const truncatedPublicKey = removeEllipticCurvePadding(senderPublicKey);

//   return {
//     txId: transactionId,
//     amount: "2154549703648910716",
//     expirationTimestamp: 438953,
//     nonce: 1,
//     receiverPublicKey:
//       "0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020",
//     receiverVaultId: 21,
//     senderVaultId: 34,
//     token: "0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4",
//     signature: {
//       r: "0x735fffa9bf371ca294c5f74c15b434684cfe7e9e0500e6a59589ef05c1fce13",
//       s: "0x1ddc49993ad678e2b5b80fb0e22a077b136353514f60edc3c2fc77d59dbd93e",
//     },
//     senderPublicKey:
//       "0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4",
//   };

  return {
    txId: transactionId,
    amount: amount,
    nonce: nonce,
    senderPublicKey: truncatedPublicKey,
    senderVaultId: senderVaultId,
    token: token,
    receiverPublicKey: receiverPublicKey,
    receiverVaultId: receiverVaultId,
    expirationTimestamp: expirationTimestamp,
    signature: {
      r: r,
      s: s,
    },
  };
}

function removeEllipticCurvePadding(input) {
  let key = input.substring(2); // remove the elliptic curve prefix 02, 03, etc.

  while (key[0] === "0") {
    key = key.substring(1);
  }
  key = `0x${key}`;
  return key;
}

async function sendTransactionToGateway(transaction) {
  console.log(">>>>> Sending transfer transaction");
  console.log(transaction);
  const batchToFind = (await starkExAPI.feederGateway.getLastBatchId()) + 1;
  try {
    const response = await starkExAPI.gateway.transfer(transaction);

    console.log(`Response from GW:`);
    console.log(response);
  } catch (err) {
    console.log(err);
  }

  await getBatchInfo(batchToFind);
}

async function getBatchInfo(batchId) {
  // Getting batch info
  try {
    const batchInfo = await starkExAPI.feederGateway.getBatchInfo(batchId);

    console.log(`Batch ${batchId} info:`);
    console.log(JSON.stringify(batchInfo));
  } catch (err) {
    if (err.code === "StarkErrorCode.INVALID_BATCH_ID") {
      // cant find batch id batchToFind.
      // try to find it previous batch
      console.log(
        `Batch ${batchId} is not exist yet! Try to find its previous.`
      );
      const batchInfo = await starkExAPI.feederGateway.getBatchInfo(
        batchId - 1
      );
      console.log(`Batch ${batchId - 1} info:`);
      console.log(JSON.stringify(batchInfo));
      return;
    }
    console.log(err);
  }
}

/////// OPERATION CODE
const amount = "1";
const expirationTimestamp = 460000;
const nonce = 5;
const receiverPublicKey =
  "0x46b17bb22dc4546b650fa1d04c1d9d1ee0f3e7c24fbd547ad869d7548e8fb52";
const receiverVaultId = 22109204;
const senderVaultId = 2210920;
const ethPrivateKey = process.env.PRIVATE_KEY;
const token =
  "0x04009a657604b0088703df472f27bb98c210aca59e93b20f1a6441004b02cdc4";

transfer(
  amount,
  expirationTimestamp,
  nonce,
  receiverPublicKey,
  receiverVaultId,
  senderVaultId,
  ethPrivateKey,
  token
);
// getBatchInfo(1900);
// { txId: 22707, code: 'TRANSACTION_PENDING' }
// 1900
// { txId: 22708, code: 'TRANSACTION_PENDING' }
// 1900
