pragma solidity ^0.4.18;

import './interfaces/IDAVToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import './OwnedPausableToken.sol';


/**
 * @title DAV Token
 * @dev ERC20 token
 */
contract DAVToken is IDAVToken, BurnableToken, OwnedPausableToken {

  // Token constants
  string public name = 'DAV Token';
  string public symbol = 'DAV';
  uint8 public decimals = 18;

  /**
   * @notice DAVToken constructor
   * Runs once on initial contract creation. Sets initial supply and balances.
   */
  function DAVToken(uint256 _initialSupply) public {
    totalSupply_ = _initialSupply;
    balances[msg.sender] = totalSupply_;
  }

}
