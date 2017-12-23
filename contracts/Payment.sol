pragma solidity ^0.4.15;

import './DAVToken.sol';
import './Identity.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/Math.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract Payment is Ownable {
  address private tokenAddress;
  address private identityAddress;
  address private subsidyWallet;

  struct Subsidy {
    uint256 remainingSubsidyAllotment;
    uint256 maxSubsidizedPercent;
  }

  mapping (bytes16 => uint256) public subsidyBalances;
  mapping (bytes16 => Subsidy) public whiteListedIdentities;

  /**
   * @dev The constructor takes DAV token address, identity contract address and subsidy wallet address and
   * initiate the Payment contract
   */
  function Payment(address _tokenAddress, address _identityAddress, address _subsidyWallet)  public {
    tokenAddress = _tokenAddress;
    identityAddress = _identityAddress;
    subsidyWallet = _subsidyWallet;
  }

  /**
   * @dev get token balance of identity
   * @param _identity The identity bytes16 identifier
   * @return uint which contains identity balance
   */
  function getBalance(bytes16 _identity) constant returns(uint) {
    DAVToken token = DAVToken(tokenAddress);
    Identity identity = Identity(identityAddress);
    return token.balanceOf(identity.getWallet(_identity));
  }

  /**
   * @dev get token balance of identity
   * @param _identityFrom The identity bytes16 identifier of the sender
   * @param _identityTo The identity bytes16 identifier of thr receiver
   * @param _value The tokens amount
   * @return bool which indicates the operation result
   */
  function transferFrom(bytes16 _identityFrom, bytes16 _identityTo, uint256 _value) returns(bool) {
    require(getBalance(_identityFrom) +
        Math.min256(
          whiteListedIdentities[_identityTo].remainingSubsidyAllotment,
          SafeMath.mul(subsidyBalances[_identityFrom], whiteListedIdentities[_identityTo].maxSubsidizedPercent)
          )
        >= _value);

    DAVToken token = DAVToken(tokenAddress);
    Identity identity = Identity(identityAddress);

    // Figure out how much of the payment will come from subsidy
    uint256 fromSubsidy = Math.min256(
      Math.min256(
          SafeMath.mul(_value, whiteListedIdentities[_identityTo].maxSubsidizedPercent),
          whiteListedIdentities[_identityTo].remainingSubsidyAllotment
        ),
      subsidyBalances[_identityFrom]
      );

    // Transfer the tokens from the wallet holding the subsidies
    token.transferFrom(subsidyWallet, identity.getWallet(_identityTo), fromSubsidy);

    // Deduct amount that comes out of subsidy from the sender's subsidy balance
    subsidyBalances[_identityFrom] = SafeMath.sub(subsidyBalances[_identityFrom], fromSubsidy);

    // Deduct amount that comes out of subsidy from the recipient's remaining
    // subsidy allotment
    whiteListedIdentities[_identityTo].remainingSubsidyAllotment = SafeMath.sub(whiteListedIdentities[_identityTo].remainingSubsidyAllotment, fromSubsidy);

    // Transfer the tokens from the wallet holding the subsidies
    token.transferFrom(identity.getWallet(_identityFrom), identity.getWallet(_identityTo), SafeMath.sub(_value, fromSubsidy));

    return true;
  }

  /**
   * @dev creates subsidy to an identity
   * @param _identity The identity bytes16 identifier
   * @param _maxSubsidyAllotment The subsidy tokens allotment
   * @param _maxSubsidizedPercent Transaction cost coverage percentage
   * @return bool which indicates the operation result
   */
  function createSubsidy(bytes16 _identity, uint256 _maxSubsidyAllotment, uint256 _maxSubsidizedPercent) onlyOwner returns(bool) {
    whiteListedIdentities[_identity] = Subsidy(_maxSubsidyAllotment, _maxSubsidizedPercent);
    return true;
  }

  /**
   * @dev deletes subsidy to an identity
   * @param _identity The identity bytes16 identifier
   * @return bool which indicates the operation result
   */
  function removeSubsidy(bytes16 _identity) onlyOwner returns(bool) {
    delete whiteListedIdentities[_identity];
    return true;
  }

  /**
   * @dev add subsidy to a specific identity
   * @param _identity The identity bytes16 identifier
   * @param _value The tokens amount
   * @return bool which indicates the operation result
   */
  function addSubsidyTokens(bytes16 _identity, uint256 _value) onlyOwner returns(bool) {
    subsidyBalances[_identity] = SafeMath.add(subsidyBalances[_identity], _value);
    return true;
  }

  /**
   * @dev adds subsidy to a specific identity
   * @param _identity The identity bytes16 identifier
   * @return bool which indicates the operation result
   */
  function removeSubsidyTokens(bytes16 _identity) onlyOwner returns(bool) {
    delete subsidyBalances[_identity];
    return true;
  }

  /**
   * @dev sets new subsidy wallet
   * @param _subsidyWallet Address of the new subsidy wallet
   * @return bool which indicates the operation result
   */
  function setSubsidyWalletAddress(address _subsidyWallet) onlyOwner returns(bool) {
    subsidyWallet = _subsidyWallet;
    return true;
  }

}
