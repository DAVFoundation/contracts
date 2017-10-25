pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';

/**
 * @title DAV Token
 * @dev ERC20 token
 */
contract DAVToken is StandardToken {

  // Token constants
  // NOTE: These are placeholder values used during development. Final supply and precision to be determined later.
  string public constant name = 'DAV Token';
  string public constant symbol = 'DAV';
  uint8 public constant decimals = 18;
  uint256 public constant INITIAL_SUPPLY = 1000000 * (10 ** uint256(decimals)); // Number of tokens padded with 0s for number of decimal places


  /**
   * @dev DAVToken constructor
   * Runs once on initial contract creation. Sets total supply and balances.
   */
  function DAVToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}
