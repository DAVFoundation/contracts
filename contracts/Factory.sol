pragma solidity ^0.4.15;

import './identity/Identity.sol';
import './identity/IdentityRelay.sol';

contract Factory {
    // index of created contracts
    address[] public identities;

    /**
     * @dev get number of total identites created
     * @return uint which contains identites count
     */
    function getIdentitiesCount() constant returns(uint) {
        return identities.length;
    }

    /**
     * @dev create new identity
     * @param _identityName send the ethers to this address
     * @return address of the created identity contract
     */
    function createIdentity(bytes32 _identityName) returns(address) {
        Identity identity = new Identity(_identityName);
        IdentityRelay identityRelay = new IdentityRelay(identity);
        identities.push(identityRelay);
        return identityRelay;
    }
}
