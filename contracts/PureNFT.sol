// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PureNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string private _pureBaseUri;

    constructor(string memory baseUri) ERC721("PureNFT", "PN") {
        _pureBaseUri = baseUri;
    }

    function awardItem(address recipient) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);

        return newItemId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _pureBaseUri;
    }
}
