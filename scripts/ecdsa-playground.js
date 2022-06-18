// This is just my playing with ecdsa only.

var EC = require("elliptic").ec;

// better create it once and reuse it
var ec = new EC("secp256k1");

var key = ec.genKeyPair();

console.log(key);

