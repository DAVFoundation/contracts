pragma solidity ^0.4.15;

import "./DAVToken.sol";

/**
 * @title Identity
 */
contract Identity {

  struct DAVIdentity {
    address wallet;
  }

  mapping (address => DAVIdentity) private identities;

  DAVToken private token;

  bytes private constant MESSAGE_PREFIX = "\x19Ethereum Signed Message:\n32";
  bytes private constant DAV_REGESTRATION_REQUEST = "DAV_REGESTRATION_REQUEST";


  /**
    * @dev Constructor
    *
    * @param _davTokenContract address of the DAVToken contract
    */
  function Identity(DAVToken _davTokenContract) public {
    token = _davTokenContract;
  }

  function register(address _id, address _wallet, uint8 _v, bytes32 _r, bytes32 _s) public {
    // Make sure id isn't registered already
    require(
      identities[_id].wallet == 0x0
    );
    // Generate message hash
    bytes32 prefixedHash = keccak256(MESSAGE_PREFIX, keccak256(DAV_REGESTRATION_REQUEST));
    // Verify message signature
    require(
      ecrecover(prefixedHash, _v, _r, _s) == _id
    );

    // Register in identities mapping
    identities[_id] = DAVIdentity({
      wallet: _wallet
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
