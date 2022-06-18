const starkwareCrypto = require("@starkware-industries/starkware-crypto-utils");
const { ethers } = require("hardhat");
const ethersjs = require("ethers");
const encUtils = require("enc-utils");
const BN = require("bn.js");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const STARKEX_ADDRESS = process.env.STARKEX_ADDRESS;

const wallet = new ethers.Wallet(PRIVATE_KEY);

const DEFAULT_MESSAGE = "StarkKeyDerivation";
const USER_REGISTRATION_MSG = "UserRegistration:";
const STARK_PUBLIC_KEY =
  "0xada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c";
const STARK_PRIVATE_KEY =
  "0x4ab630a6cd851cbdf5662d9f83da0c9a6932ac87ae0eb307025cb74a3928d1c";

const secondWalletAddress = "0xC774461219003a11cb3f8bef7D9AF705E42d692C";
const secondWalletPrivateKey =
  "22199ac78a202c025c4058939003c753045e2b66d5d78d08d4446503637ef10a";

async function namhTestSigning() {
  const sampleTransfer = {
    quantizedAmount: "10",
    expiration_timestamp: 459800,
    nonce: 221091,
    receiverPublicKey:
      "0x46b17bb22dc4546b650fa1d04c1d9d1ee0f3e7c24fbd547ad869d7548e8fb52",
    receiverVaultId: 22109204,
    senderVaultId: 2210920,
    token: "0x04009a657604b0088703df472f27bb98c210aca59e93b20f1a6441004b02cdc4",
  };

  // get stark private key
  const aWallet = new ethers.Wallet(PRIVATE_KEY);
  const message = DEFAULT_MESSAGE;
  const signature = await aWallet.signMessage(message);
  const starkPrivateKey =
    starkwareCrypto.keyDerivation.getPrivateKeyFromEthSignature(signature);
  const starkKey =
    starkwareCrypto.keyDerivation.privateToStarkKey(starkPrivateKey);
  console.log(`starkKey: ${starkKey}`);
  const starkKeyPair = starkwareCrypto.ec.keyFromPrivate(
    starkPrivateKey,
    "hex"
  );

  const msgHash = starkwareCrypto.getTransferMsgHash(
    sampleTransfer.quantizedAmount, // - amount (uint63 decimal str)
    sampleTransfer.nonce, // - nonce (uint31)
    sampleTransfer.senderVaultId, // - sender_vault_id (uint31)
    sampleTransfer.token, // - token (hex str with 0x prefix < prime)
    sampleTransfer.receiverVaultId, // - target_vault_id (uint31)
    sampleTransfer.receiverPublicKey, // - target_public_key (hex str with 0x prefix < prime)
    sampleTransfer.expiration_timestamp // - expiration_timestamp (uint22)
  );
  console.log(`mgsHash: ${msgHash}`);
  const starkPublicKey = starkKeyPair.getPublic().encode("hex", true);
  console.log(`starkPublicKey: ${starkPublicKey}`);
  const { r, s } = await starkwareCrypto.sign(starkKeyPair, msgHash);
  console.log("r: " + r.toJSON());
  //5ee9708f60ea29562d66083ef7e4d62f23dba9736f74dccb4f334c58c946797
  console.log("s: " + s.toJSON());
  //6a12fe4d401b7aaa4ac31b6b6fe5ba445b7d8501131c1a74c7691db92452774

  /// Verify
  console.log("");
  console.log("Verifying.....");
  const rBigNumber = new BN(r.toJSON(), 16);
  const sBigNumber = new BN(s.toJSON(), 16);
  const derivedSignature = { r: rBigNumber, s: sBigNumber };
  const keyPairFromPubKey = starkwareCrypto.ec.keyFromPublic(
    starkPublicKey,
    "hex"
  );
  console.log(derivedSignature);
  const result = starkwareCrypto.verify(
    keyPairFromPubKey,
    msgHash.toString(16),
    derivedSignature
  );

  console.log(`Transaction valid? ${result}`);
}

namhTestSigning();

const transfer = {
  amount: "2154549703648910716",
  expiration_timestamp: 438953,
  nonce: 1,
  target_public_key:
    "0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020",
  target_vault_id: 21,
  sender_vault_id: 34,
  token: "0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4",
  signature: {
    r: "0x735fffa9bf371ca294c5f74c15b434684cfe7e9e0500e6a59589ef05c1fce13",
    s: "0x1ddc49993ad678e2b5b80fb0e22a077b136353514f60edc3c2fc77d59dbd93e",
  },
  sender_public_key:
    "0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4",
};

async function testSignTransferTx() {
  const aWallet = new ethers.Wallet(PRIVATE_KEY);
  const message = USER_REGISTRATION_MSG;
  const signature = await aWallet.signMessage(message);
  const starkPrivateKey =
    starkwareCrypto.keyDerivation.getPrivateKeyFromEthSignature(signature);
  const starkKey =
    starkwareCrypto.keyDerivation.privateToStarkKey(starkPrivateKey);
  const starkKeyPair = starkwareCrypto.ec.keyFromPrivate(
    starkPrivateKey,
    "hex"
  );
  const starkPublicKey = "0x" + starkKeyPair.getPublic().getX().toString("hex");
  console.log(`starkPublicKey1: ${starkPublicKey}`);

  const starkPublicKey2 = starkKeyPair.getPublic().encode("hex", true);
  console.log("starkPublicKey2: " + starkPublicKey2);

  // Test gen keypair from pubkey:
  //const newKeyPair2 = starkwareCrypto.ec.keyFromPublic(starkPublicKey2, "hex");
  //console.log(">>>>> newKeyPair2: " + newKeyPair2);

  const msgHash = starkwareCrypto.getTransferMsgHash(
    transfer.amount, // - amount (uint63 decimal str)
    transfer.nonce, // - nonce (uint31)
    transfer.sender_vault_id, // - sender_vault_id (uint31)
    transfer.token, // - token (hex str with 0x prefix < prime)
    transfer.target_vault_id, // - target_vault_id (uint31)
    transfer.target_public_key, // - target_public_key (hex str with 0x prefix < prime)
    transfer.expiration_timestamp // - expiration_timestamp (uint22)
  );

  const testSignature = starkwareCrypto.sign(starkKeyPair, msgHash);
  const r1 = new BN(transfer.signature.r.substring(2), 16);
  const s1 = new BN(transfer.signature.s.substring(2), 16);
  const sampleSignature = { r: r1, s: s1 };

  //const namhPubKey =
  //  "0x0201de86d858998f37f37a71eb111267adeea3bbf6e370f450fb08456aeecb7b06".substring(
  //    2
  //  );
  //console.log(`namhPubKey: ${namhPubKey}`);
  //const customKeyPair = starkwareCrypto.ec.keyFromPublic(namhPubKey, "hex");
  //console.log(">>>>> namh: " + customKeyPair);

  const sampleKeyPair = starkwareCrypto.ec.keyFromPublic(
    `020${transfer.sender_public_key.substring(2)}`,
    "hex"
  );
  const result = starkwareCrypto.verify(
    sampleKeyPair,
    msgHash.toString(16),
    testSignature
  );

  console.log(result);
}
// testSignTransferTx();
