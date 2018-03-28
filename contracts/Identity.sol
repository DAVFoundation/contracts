pragma solidity ^0.4.15;

import './DAVToken.sol';


/**
 * @title Identity
 */
contract Identity {

  struct DAVIdentity {
    address wallet;
  }

  mapping (address => DAVIdentity) private identities;

  DAVToken private token;

  // Prefix to added to messages signed by web3
  bytes28 private constant ETH_SIGNED_MESSAGE_PREFIX = '\x19Ethereum Signed Message:\n32';
  bytes25 private constant DAV_REGISTRATION_REQUEST = 'DAV Identity Registration';

  /**
   * @dev Constructor
   *
   * @param _davTokenContract address of the DAVToken contract
   */
  function Identity(DAVToken _davTokenContract) public {
    token = _davTokenContract;
  }

  function register(address _id, uint8 _v, bytes32 _r, bytes32 _s) public {
    // Make sure id isn't registered already
    require(
      identities[_id].wallet == 0x0
    );
    // Generate message hash
    bytes32 prefixedHash = keccak256(ETH_SIGNED_MESSAGE_PREFIX, keccak256(DAV_REGISTRATION_REQUEST));
    // Verify message signature
    require(
      ecrecover(prefixedHash, _v, _r, _s) == _id
    );

    // Register in identities mapping
    identities[_id] = DAVIdentity({
      wallet: msg.sender
    });
  }

  function registerSimple() public {
    // Make sure id isn't registered already
    require(
      identities[msg.sender].wallet == 0x0
    );

    // Register in identities mapping
    identities[msg.sender] = DAVIdentity({
      wallet: msg.sender
    });
  }

  function getBalance(address _id) public view returns (uint256 balance) {
    return token.balanceOf(identities[_id].wallet);
  }

  function verifyOwnership(address _id, address _wallet) public view returns (bool verified) {
    return identities[_id].wallet == _wallet;
  }

  // Check identity registration status
  function isRegistered(address _id) public view returns (bool) {
    return identities[_id].wallet != 0x0;
  }
}
