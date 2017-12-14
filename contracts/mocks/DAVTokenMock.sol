pragma solidity ^0.4.15;

import '../DAVToken.sol';

/**
 * @title DAV Token Mock
 * @dev ERC20 token
 */
contract DAVTokenMock is DAVToken {

  /**
   * @dev DAVTokenMock constructor
   * Runs once on initial contract creation. Sets total supply and balances.
   */
  function DAVTokenMock() public {
    totalSupply = 100;
    balances[msg.sender] = 100;
  }
}
