pragma solidity ^0.4.15;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Identity is Ownable {
    bytes32 public identityName;

    event SendEther(uint _amount, address indexed _to);

    function Identity(bytes32 _identityName) {
        identityName = _identityName;
    }

    function sendEther(uint _amount, address _to) onlyOwner returns(bool) {
        _to.transfer(_amount);
        SendEther(_amount, _to);
        return true;
    }
}
