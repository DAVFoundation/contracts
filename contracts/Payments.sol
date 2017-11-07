pragma solidity ^0.4.15;

import './DAVToken.sol';
import './Identities.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Payments is Ownable {
    address private tokenAddress;
    address private identitiesAddress;

    struct Subsidy {
        uint256 remainingSubsidyAllotment;
        uint256 maxDealSubsidy; // Percentage
    }

    mapping (bytes16 => uint256) public subsidyBalances;
    mapping (bytes16 => Subsidy) public whiteListedIdentities;

    function Payments(address _tokenAddress, address _identitiesAddress) {
        tokenAddress = _tokenAddress;
        identitiesAddress = _identitiesAddress;
    }

    /**
     * @dev get token balance of identity
     * @param _identity The identity bytes16 identifier
     * @return uint which contains identity balance
     */
    function getBalance(bytes16 _identity) constant returns(uint) {
        DAVToken token = DAVToken(tokenAddress);
        Identities identities = Identities(identitiesAddress);
        return token.balanceOf(identities.getWallet(_identity));
    }

    /**
     * @dev get token balance of identity
     * @param _identityFrom The identity bytes16 identifier of the sender
     * @param _identityTo The identity bytes16 identifier of thr receiver
     * @param _value The tokens amount
     * @return bool which indicates the operation result
     */
    function transferFrom(bytes16 _identityFrom, bytes16 _identityTo, uint256 _value) returns(bool) {
        DAVToken token = DAVToken(tokenAddress);
        Identities identities = Identities(identitiesAddress);
        token.transferFrom(identities.getWallet(_identityFrom), identities.getWallet(_identityTo), _value);
        return true;
    }

}
