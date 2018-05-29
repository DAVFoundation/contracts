pragma solidity 0.4.23;

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

  // Time after which pause can no longer be called
  uint256 public pauseCutoffTime;

  /**
   * @notice DAVToken constructor
   * Runs once on initial contract creation. Sets initial supply and balances.
   */
  constructor(uint256 _initialSupply) public {
    totalSupply_ = _initialSupply;
    balances[msg.sender] = totalSupply_;
  }

  /**
   * Set the cutoff time after which the token can no longer be paused
   * Cannot be in the past. Can only be set once.
   *
   * @param _pauseCutoffTime Time for pause cutoff.
   */
  function setPauseCutoffTime(uint256 _pauseCutoffTime) onlyOwner public {
    // Make sure time is not in the past
    // solium-disable-next-line security/no-block-members
    require(_pauseCutoffTime >= block.timestamp);
    // Make sure cutoff time hasn't been set already
    require(pauseCutoffTime == 0);
    // Set the cutoff time
    pauseCutoffTime = _pauseCutoffTime;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() onlyOwner whenNotPaused public {
    // Make sure pause cut off time isn't set or if it is, it's in the future
    // solium-disable-next-line security/no-block-members
    require(pauseCutoffTime == 0 || pauseCutoffTime >= block.timestamp);
    paused = true;
    emit Pause();
  }

}
