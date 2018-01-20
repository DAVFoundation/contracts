pragma solidity ^0.4.15;


/**
 * @title DAV Token
 * @dev ERC20 token
 */
contract Identity {

  struct DAVIdentity {
    address wallet;
  }

  mapping (string => DAVIdentity) private identities;

  address private DAVTokenContract;

  /**
   * @dev Constructor
   *
   * @param _davTokenContract address of the DAVToken contract
   */
  function Identity(address _davTokenContract) public {
    DAVTokenContract = _davTokenContract;
  }

  function parseAddr(string _address) internal pure returns (address) {
    bytes memory a = bytes(_address);
    uint160 iaddr = 0;
    uint160 b1;
    uint160 b2;
    for (uint i=2; i<2+2*20; i+=2){
      iaddr *= 256;
      b1 = uint160(a[i]);
      b2 = uint160(a[i+1]);
      if ((b1 >= 97)&&(b1 <= 102)) b1 -= 87;
      else if ((b1 >= 48)&&(b1 <= 57)) b1 -= 48;
      if ((b2 >= 97)&&(b2 <= 102)) b2 -= 87;
      else if ((b2 >= 48)&&(b2 <= 57)) b2 -= 48;
      iaddr += (b1*16+b2);
    }
    return address(iaddr);
  }

  function register(string _id, address _wallet, uint8 _v, bytes32 _r, bytes32 _s) public returns (bool) {
    address identityAddress = parseAddr(_id);

    // Verify signature
    require(
      ecrecover(keccak256(_id), _v, _r, _s) == identityAddress
    );

    // Make sure id isn't registered already
    require(
      identities[_id].wallet == 0x0
    );

    // Register in identities mapping
    identities[_id] = DAVIdentity({
      wallet: _wallet
    });

    return true;
  }

}
