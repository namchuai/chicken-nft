const BN = require("bn.js");
const { ethers } = require("hardhat");
const ethersjs = require("ethers");
const { asset } = require("@starkware-industries/starkware-crypto-utils");

const myKey =
  "0x46b17bb22dc4546b650fa1d04c1d9d1ee0f3e7c24fbd547ad869d7548e8fb52";
const correctKey =
  "0x0200ada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c";
// addingEcPrefix(myKey);

function removeLeadingZeroes(input) {
  let key = input;
  key = removeHexPrefix(key);

  while (key[0] === "0") {
    key = key.substring(1);
    console.log(key);
  }

  return `0x${key}`;
}

function removeHexPrefix(input) {
  if (input.substring(0, 2) === "0x") {
    return input.substring(2);
  }
  return input;
}

function addingEcPrefix(input) {
  let key = input;
  key = removeHexPrefix(key);

  if (key.length > 64) {
    throw `Key length exceeded.`;
  }

  while (key.length < 66) {
    key = `0${key}`;
  }
  key = "0x02" + key.substring(2);

  console.log(key);
  console.log(key.length);

  console.log(correctKey.length);
}

// const test = "934598345823102341023418534284123023412134902341";
// const testBn = new BN(test, 10);
// console.log(testBn.toString(10));

const zeroBn = new BN(0);
const quantum = 1;
console.log(BN.isBN(quantum));
const quantumBn = new BN(quantum);

if (quantumBn.lte(zeroBn)) {
  console.log("well well well");
}

// console.log(new BN(-1).toNumber());

console.log(removeLeadingZeroes(correctKey));

// 0x0eD03E6917543a45af099909f07bC5b4C69E868A
const addressToTest = "0x0eD03E6917543a45af099909f07bC5b4C69E868A";
console.log(
  `hardhat ether: is address ${addressToTest} valid: ${ethers.utils.isAddress(
    addressToTest
  )}`
);

console.log(
  `ethersjs: is address ${addressToTest} valid: ${ethersjs.utils.isAddress(
    addressToTest
  )}`
);

//assetType: 0x25b34f3131c74ef5ec423d28685ac9cceec2bd5981b22e73fdd88a035e9f736
const assetType =
  "0x039c01b98004d2b0ab0cd5bc291c43384383ca64ec3b6b9c18c764eb53d0073f";
const assetTypeBn = new BN(removeHexPrefix(assetType), 16);
console.log(assetTypeBn);
console.log(`0x${assetTypeBn.toString(16)}`);

console.log("===========");
const starkKey =
  "0x000ada2f7b5ca57b82a8c1f5a19e88287ae43a2915767cb70831dd44548f7700c";
const starkKeyBn = new BN(removeHexPrefix(starkKey), 16);
console.log(starkKeyBn);
console.log(`0x${starkKeyBn.toString(16)}`);

function trimHexString(input) {
  let key = input;
  key = removeHexPrefix(key);

  const inputBn = new BN(key, 16);
  return `0x${inputBn.toString(16)}`;
}

console.log("===========");
const testHexStr =
  "0x039c01b98004d2b0ab0cd5bc291c43384383ca64ec3b6b9c18c764eb53d0073f";
console.log(trimHexString(testHexStr));

console.log("===========");
const amount = "-1";
const amountBn = new BN(amount);
// console.log(amountBn.toString(10));
