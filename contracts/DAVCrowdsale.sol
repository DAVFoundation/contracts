pragma solidity ^0.4.18;

import './PausableCrowdsale.sol';
import 'openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol';
import './interfaces/IDAVToken.sol';

/**
 * @title DAVCrowdsale
 * @dev DAV Crowdsale contract
 */
contract DAVCrowdsale is PausableCrowdsale, FinalizableCrowdsale {

  // Opening time for Whitelist B
  uint256 public openingTimeB;
  // Sum of contributions in Wei, per beneficiary
  mapping(address => uint256) public contributions;
  // List of beneficiaries whitelisted in group A
  mapping(address => bool) public whitelistA;
  // List of beneficiaries whitelisted in group B
  mapping(address => bool) public whitelistB;
  // Minimal contribution amount in Wei per transaction
  uint256 public minimalContribution;
  // Maximal total contribution amount in Wei per beneficiary
  uint256 public maximalIndividualContribution;
  // Maximal acceptable gas price
  uint256 public constant MAX_GAS_PRICE = 50000000000 wei;
  // Wallet to transfer foundation tokens to
  address public tokenWallet;
  // DAV Token
  IDAVToken public davToken;

  function DAVCrowdsale(uint256 _rate, address _wallet, address _tokenWallet, IDAVToken _token, uint256 _minimalContribution, uint256 _maximalIndividualContribution, uint256 _openingTime, uint256 _openingTimeB, uint256 _closingTime) public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
  {
    require(_openingTimeB >= _openingTime);
    require(_openingTimeB <= _closingTime);
    require(_minimalContribution > 0);
    require(_maximalIndividualContribution > 0);
    require(_minimalContribution <= _maximalIndividualContribution);
    require(_tokenWallet != address(0));
    minimalContribution = _minimalContribution;
    maximalIndividualContribution = _maximalIndividualContribution;
    openingTimeB = _openingTimeB;
    tokenWallet = _tokenWallet;
    davToken = _token;
  }

  /**
   * Add a group of users to whitelist A
   *
   * @param _beneficiaries List of addresses to be whitelisted
   */
  function whitelistUsersA(address[] _beneficiaries) external onlyOwner {
    for (uint256 i = 0; i < _beneficiaries.length; i++) {
      whitelistA[_beneficiaries[i]] = true;
    }
  }

  /**
   * Add a group of users to whitelist B
   *
   * @param _beneficiaries List of addresses to be whitelisted
   */
  function whitelistUsersB(address[] _beneficiaries) external onlyOwner {
    for (uint256 i = 0; i < _beneficiaries.length; i++) {
      whitelistB[_beneficiaries[i]] = true;
    }
  }

  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
    super._preValidatePurchase(_beneficiary, _weiAmount);
    // Verify amount is larger than or equal to minimal contribution
    require(_weiAmount >= minimalContribution);
    // Verify that the gas price is lower than 50 gwei
    require(tx.gasprice <= MAX_GAS_PRICE);
    // Verify that user hasn't contributed more than the individual hard cap
    require(contributions[_beneficiary].add(_weiAmount) <= maximalIndividualContribution);
    // Verify that user is in whitelist A, or in whitelist B and the openingTimeB has passed
    require(whitelistA[_beneficiary] || (whitelistB[_beneficiary] && block.timestamp >= openingTimeB));
  }

  function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal {
    super._updatePurchasingState(_beneficiary, _weiAmount);
    // Update user contribution total
    contributions[_beneficiary] = contributions[_beneficiary].add(_weiAmount);
  }

  function finalization() internal {
    super.finalization();
    // transfer token Ownership back to original owner
    davToken.transferOwnership(owner);
  }

}
