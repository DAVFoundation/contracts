pragma solidity ^0.4.15;

import '../helpers/Ownable.sol';

contract IdentityRelay is Ownable {
    address public currentVersion;

    function IdentityRelay(address _initAddr){
        currentVersion = _initAddr;
    }

    function update(address _newAddress) onlyOwner {
        currentVersion = _newAddress;
    }

    function() {
        // if(!currentVersion.delegatecall(msg.data)) throw;
        require(currentVersion.delegatecall(msg.data));
    }
}
