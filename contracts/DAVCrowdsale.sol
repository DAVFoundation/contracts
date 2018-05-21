pragma solidity 0.4.23;

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
  // Maximum number of Wei that can be raised
  uint256 public weiCap;
  // Maximum number of Vincis that can be sold in Crowdsale
  uint256 public vinciCap;
  // Minimal contribution amount in Wei per transaction
  uint256 public minimalContribution;
  // Maximal total contribution amount in Wei per beneficiary
  uint256 public maximalIndividualContribution;
  // Maximal acceptable gas price
  uint256 public gasPriceLimit = 50000000000 wei;
  // Wallet to transfer foundation tokens to
  address public tokenWallet;
  // Wallet to transfer locked tokens to (e.g., presale buyers)
  address public lockedTokensWallet;
  // DAV Token
  IDAVToken public davToken;
  // Amount of Vincis sold
  uint256 public vinciSold;

  constructor(uint256 _rate, address _wallet, address _tokenWallet, address _lockedTokensWallet, IDAVToken _token, uint256 _weiCap, uint256 _vinciCap, uint256 _minimalContribution, uint256 _maximalIndividualContribution, uint256 _openingTime, uint256 _openingTimeB, uint256 _closingTime) public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
  {
    require(_openingTimeB >= _openingTime);
    require(_openingTimeB <= _closingTime);
    require(_weiCap > 0);
    require(_vinciCap > 0);
    require(_minimalContribution > 0);
    require(_maximalIndividualContribution > 0);
    require(_minimalContribution <= _maximalIndividualContribution);
    require(_tokenWallet != address(0));
    require(_lockedTokensWallet != address(0));
    weiCap = _weiCap;
    vinciCap = _vinciCap;
    minimalContribution = _minimalContribution;
    maximalIndividualContribution = _maximalIndividualContribution;
    openingTimeB = _openingTimeB;
    tokenWallet = _tokenWallet;
    lockedTokensWallet= _lockedTokensWallet;
    davToken = _token;
  }

  /**
   * @dev Modifier to make a function callable only if user is in whitelist A, or in whitelist B and openingTimeB has passed
   */
  modifier onlyWhitelisted(address _beneficiary) {
    require(whitelistA[_beneficiary] || (whitelistB[_beneficiary] && block.timestamp >= openingTimeB));
    _;
  }

  /**
   * @dev Change the gas price limit
   *
   * @param _gasPriceLimit New gas price limit
   */
  function setGasPriceLimit(uint256 _gasPriceLimit) external onlyOwner {
    gasPriceLimit = _gasPriceLimit;
  }

  /**
   * Add a group of users to whitelist A
   *
   * @param _beneficiaries List of addresses to be whitelisted
   */
  function addUsersWhitelistA(address[] _beneficiaries) external onlyOwner {
    for (uint256 i = 0; i < _beneficiaries.length; i++) {
      whitelistA[_beneficiaries[i]] = true;
    }
  }

  /**
   * Add a group of users to whitelist B
   *
   * @param _beneficiaries List of addresses to be whitelisted
   */
  function addUsersWhitelistB(address[] _beneficiaries) external onlyOwner {
    for (uint256 i = 0; i < _beneficiaries.length; i++) {
      whitelistB[_beneficiaries[i]] = true;
    }
  }

  /**
   * Allow adjustment of the closing time
   *
   * @param _closingTime Time to close the sale. If in the past will set to the present
   */
  function closeEarly(uint256 _closingTime) external onlyOwner onlyWhileOpen {
    // Make sure the new closing time isn't after the old closing time
    require(_closingTime <= closingTime);
    // solium-disable-next-line security/no-block-members
    if (_closingTime < block.timestamp) {
      // If closing time is in the past, set closing time to right now
      closingTime = block.timestamp;
    } else {
      // Update the closing time
      closingTime = _closingTime;
    }
  }

  /**
   * Record a transaction that happened during the presale and transfer tokens to locked tokens wallet
   *
   * @param _weiAmount Value in wei involved in the purchase
   * @param _vinciAmount Amount of Vincis sold
   */
  function recordSale(uint256 _weiAmount, uint256 _vinciAmount) external onlyOwner {
    // Verify that the amount won't put us over the wei cap
    require(weiRaised.add(_weiAmount) <= weiCap);
    // Verify that the amount won't put us over the vinci cap
    require(vinciSold.add(_vinciAmount) <= vinciCap);
    // Verify Crowdsale hasn't been finalized yet
    require(!isFinalized);
    // Update crowdsale totals
    weiRaised = weiRaised.add(_weiAmount);
    vinciSold = vinciSold.add(_vinciAmount);
    // Transfer tokens
    token.transfer(lockedTokensWallet, _vinciAmount);
  }

  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal onlyWhitelisted(_beneficiary) {
    super._preValidatePurchase(_beneficiary, _weiAmount);
    // Verify that the amount won't put us over the wei cap
    require(weiRaised.add(_weiAmount) <= weiCap);
    // Verify that the amount won't put us over the vinci cap
    require(vinciSold.add(_weiAmount.mul(rate)) <= vinciCap);
    // Verify amount is larger than or equal to minimal contribution
    require(_weiAmount >= minimalContribution);
    // Verify that the gas price is lower than 50 gwei
    require(tx.gasprice <= gasPriceLimit);
    // Verify that user hasn't contributed more than the individual hard cap
    require(contributions[_beneficiary].add(_weiAmount) <= maximalIndividualContribution);
  }

  function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal {
    super._updatePurchasingState(_beneficiary, _weiAmount);
    // Update user contribution total
    contributions[_beneficiary] = contributions[_beneficiary].add(_weiAmount);
    // Update total Vincis sold
    vinciSold = vinciSold.add(_weiAmount.mul(rate));
  }

  function finalization() internal {
    super.finalization();
    // transfer tokens to foundation
    uint256 foundationTokens = weiRaised.div(2).add(weiRaised);
    foundationTokens = foundationTokens.mul(rate);
    uint256 crowdsaleBalance = davToken.balanceOf(this);
    if (crowdsaleBalance < foundationTokens) {
      foundationTokens = crowdsaleBalance;
    }
    davToken.transfer(tokenWallet, foundationTokens);
    // Burn off remaining tokens
    crowdsaleBalance = davToken.balanceOf(this);
    davToken.burn(crowdsaleBalance);
    // Set token's pause cutoff time to 3 weeks from closing time
    davToken.setPauseCutoffTime(closingTime.add(1814400));
    // transfer token Ownership back to original owner
    davToken.transferOwnership(owner);
  }

}
