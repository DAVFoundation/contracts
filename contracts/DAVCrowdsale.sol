pragma solidity ^0.4.18;

import './PausableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';
import './interfaces/IDAVToken.sol';

/**
 * @title DAVCrowdsale
 * @dev DAV Crowdsale contract
 */
contract DAVCrowdsale is MintedCrowdsale, PausableCrowdsale {

  function DAVCrowdsale(uint256 _rate, address _wallet, IDAVToken _token) public
    Crowdsale(_rate, _wallet, _token)
  {
  }

}
