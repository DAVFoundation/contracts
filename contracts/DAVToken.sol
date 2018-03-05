pragma solidity ^0.4.18;

import './interfaces/IDAVToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';


/**
 * @title DAV Token
 * @dev ERC20 token
 */
contract DAVToken is IDAVToken, MintableToken, BurnableToken, PausableToken {

  // Token constants
  // NOTE: These are placeholder values used during development. Final inital supply will be determined and announced later
  string public name = 'DAV Token';
  string public symbol = 'DAV';
  uint8 public decimals = 18;

  /**
   * @notice DAVToken constructor
   * Runs once on initial contract creation. Sets total supply and balances.
   */
  function DAVToken() public {
    uint256 initialSupply = 1000000 * (10 ** uint256(decimals)); // Number of tokens padded with 0s for number of decimal places
    totalSupply_ = initialSupply;
    balances[msg.sender] = initialSupply;
  }

}
