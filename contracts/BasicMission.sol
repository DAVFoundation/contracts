pragma solidity ^0.4.15;

import './Identity.sol';
import './DAVToken.sol';


/**
 * @title BasicMission
 * @dev The most basic contract for conducting Missions.
 *
 * This contract represents the very basic interface of a mission contract.
 * In the real world, there is very little reason to use this and not one of the
 * contracts that extend it. Consider this an interface, more than an implementation.
 */
contract BasicMission {

  uint256 private nonce;

  struct Mission {
    address seller;
    address buyer;
    uint256 cost;
    uint256 balance;
    bool isSigned;
    mapping (uint8 => bool) resolvers;
  }

  mapping (bytes32 => Mission) private missions;

  event Create(
    bytes32 id,
    address sellerId,
    address buyerId
  );

  event Signed(
    bytes32 id
  );

  DAVToken private token;
  Identity private identity;

  /**
   * @dev Constructor
   *
   * @param _identityContract address of the Identity contract
   * @param _davTokenContract address of the DAVToken contract
   */
  function BasicMission(Identity _identityContract, DAVToken _davTokenContract) public {
    identity = _identityContract;
    token = _davTokenContract;
  }

  /**
   * @notice Create a new mission
   * @param _sellerId The DAV Identity of the person providing the service
   * @param _buyerId The DAV Identity of the person ordering the service
   * @param _cost The total cost of the mission to be paid by buyer
   */
  function create(bytes32 _missionId, address _sellerId, address _buyerId, uint256 _cost) public {
    // Verify that message sender controls the buyer's wallet
    require(
      identity.verifyOwnership(_buyerId, msg.sender)
    );

    // Verify buyer's balance is sufficient
    require(
      identity.getBalance(_buyerId) >= _cost
    );

    // Make sure id isn't registered already
    require(
      missions[_missionId].buyer == 0x0
    );

    // Transfer tokens to the mission contract
    token.transferFrom(msg.sender, this, _cost);

    // Create mission
    missions[_missionId] = Mission({
      seller: _sellerId,
      buyer: _buyerId,
      cost: _cost,
      balance: _cost,
      isSigned: false
    });

    // Event
    emit Create(_missionId, _sellerId, _buyerId);
  }

  /**
  * @notice Fund a mission
  * @param _missionId The id of the mission
  * @param _buyerId The DAV Identity of the person ordering the service
  */
  function fulfilled(bytes32 _missionId, address _buyerId) public {
    // Verify that message sender controls the seller's wallet
    require(
      identity.verifyOwnership(_buyerId, msg.sender)
    );
    
    require(
      missions[_missionId].isSigned == false
    );

    require(
      missions[_missionId].balance == missions[_missionId].cost
    );
    
    
    // designate mission as signed
    missions[_missionId].isSigned = true;
    missions[_missionId].balance = 0;
    token.approve(this, missions[_missionId].cost);
    token.transferFrom(this, identity.getIdentityWallet(missions[_missionId].seller), missions[_missionId].cost);

    // Event
    emit Signed(_missionId);
  }

}
