// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PureToken is ERC20 {
    uint256 public constant coinTotalSupply = 10**18;

    constructor() ERC20("PureToken", "P") {
        _mint(msg.sender, coinTotalSupply);
    }
}
