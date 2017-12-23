pragma solidity ^0.4.15;

import './helpers/UUIDProvider.sol';
import './DAVToken.sol';

contract Identity {
  address private tokenAddress;

  mapping (bytes16 => address) public identities; // identities wallet addresses
  mapping (bytes16 => address[]) public identityToMissions; // missions hisotry

  modifier onlyOwner(bytes16 _identity) {
    require(msg.sender == identities[_identity]);
    _;
  }

  function Identity(address _tokenAddress)  public {
    tokenAddress = _tokenAddress;
  }

  /**
   * @dev get token balance of identity
   * @param _identity The identity bytes16 identifier
   * @return uint which contains identity balance
   */
  function getBalance(bytes16 _identity) constant returns(uint) {
    DAVToken token = DAVToken(tokenAddress);
    return token.balanceOf(identities[_identity]);
  }

  /**
   * @dev get identity missions history
   * @param _identity The identity bytes16 identifier
   * @return array of mission addresses
   */
  function getMissionHistory(bytes16 _identity) constant returns(address[]) {
    return identityToMissions[_identity];
  }

  /**
   * @dev get wallet of identity
   * @param _identity The identity bytes16 identifier
   * @return address of the identity wallet
   */
  function getWallet(bytes16 _identity) returns(address) {
    return identities[_identity];
  }

  /**
   * @dev change wallet of identity
   * @param _identity The identity bytes16 identifier
   * @param _newWallet The address of the new wallet
   * @return bool which indicates the operation result
   */
  function changeWallet(bytes16 _identity, address _newWallet) onlyOwner(_identity) returns(bool) {
    identities[_identity] = _newWallet;
    return true;
  }

  /**
   * @dev create new identity
   * @return bool which indicates the operation result
   */
  function create(address _wallet) returns(bool) {
    UUIDProvider uuidProvider = new UUIDProvider();
    // UUIDProvider uuidProvider = UUIDProvider(0xbb17fcd3f0be84478c4772cdb1035089aa36d4d1);
    bytes16 identityIdentifier = uuidProvider.UUID4();
    identities[identityIdentifier] = msg.sender;
    return true;
  }
}
