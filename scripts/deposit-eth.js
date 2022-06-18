const ethersjs = require("ethers");
const starkwareCrypto = require("@starkware-industries/starkware-crypto-utils");

const PRIVATE_KEY =
  "abb25844490fc78155a4f1d86d827455f1bfd0c6683966539e9b7dd95d238be0";
const PUBLIC_KEY = "0x539E04652385A048E920FD98503afAf880A00f6C";
const STARKEX_ADDRESS = "0x471bDA7f420de34282AB8AF1F5F3DAf2a4C09746";

async function depositEth(starkKey, assetType, vaultId, quantizedAmount) {
  const starkexRegisterAbi = ["function depositEth(uint, uint, uint) payable"];

  const provider = new ethersjs.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/aaf4759d85734f41a84aee6caeb3e8e5"
  );

  const contract = new ethersjs.Contract(
    STARKEX_ADDRESS,
    starkexRegisterAbi,
    provider
  );

  const nonce = await provider.getTransactionCount(PUBLIC_KEY);
  const wallet = new ethersjs.Wallet(PRIVATE_KEY, provider);
  const transaction = {
    from: PUBLIC_KEY,
    to: STARKEX_ADDRESS,
    nonce: nonce,
    gasLimit: 500000,
    value: ethersjs.utils.parseEther(quantizedAmount),
    data: contract.interface.encodeFunctionData("depositEth", [
      starkKey,
      assetType,
      vaultId,
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

function testGetAssetType() {
  const assetDict = {
    type: "ETH",
    data: {
      quantum: "1",
    },
  };
  const type = starkwareCrypto.asset.getAssetType(assetDict);
  console.log(type);
}

const starkKey =
  "0xada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c";
const assetType10_000_000 =
  "0xd5b742d29ab21fdb06ac5c7c460550131c0b30cbc4c911985174c0ea4a92ec";
// "0x1142460171646987f20c714eda4b92812b22b811f56f27130937c267e29bd9e";
const vaultId = 22111991;
const quantizedAmount = "0.5";
depositEth(starkKey, assetType10_000_000, vaultId, quantizedAmount);
// testGetAssetType();

// 50000000000