pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";


/**
 * @title Pausable token that allows transfers by owner while paused
 * @dev StandardToken modified with pausable transfers.
 **/
contract OwnedPausableToken is StandardToken, Pausable {

  /**
   * @dev Modifier to make a function callable only when the contract is not paused or the caller is the owner
   */
  modifier whenNotPausedOrIsOwner() {
    require(!paused || msg.sender == owner);
    _;
  }

  function transfer(address _to, uint256 _value) public whenNotPausedOrIsOwner returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
    return super.approve(_spender, _value);
  }

  function increaseApproval(address _spender, uint _addedValue) public whenNotPaused returns (bool success) {
    return super.increaseApproval(_spender, _addedValue);
  }

  function decreaseApproval(address _spender, uint _subtractedValue) public whenNotPaused returns (bool success) {
    return super.decreaseApproval(_spender, _subtractedValue);
  }
}
