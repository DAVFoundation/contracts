pragma solidity ^0.4.18;

import './interfaces/IDAVToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';


/**
 * @title DAV Token
 * @dev ERC20 token
 */
contract DAVToken is IDAVToken, BurnableToken, PausableToken {

  // Token constants
  string public name = 'DAV Token';
  string public symbol = 'DAV';
  uint8 public decimals = 18;

  /**
   * @notice DAVToken constructor
   * Runs once on initial contract creation. Sets total supply and balances.
   */
  function DAVToken(uint256 _totalSupply) public {
    totalSupply_ = _totalSupply;
    balances[msg.sender] = totalSupply_;
  }

}
