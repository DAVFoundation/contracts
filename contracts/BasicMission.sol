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
  function create(address _sellerId, address _buyerId, uint256 _cost) public {
    // Verify that message sender controls the buyer's wallet
    require(
      identity.verifyOwnership(_buyerId, msg.sender)
    );

    // Verify buyer's balance is sufficient
    require(
      identity.getBalance(_buyerId) >= _cost
    );

    // Transfer tokens to the mission contract
    token.transferFrom(msg.sender, this, _cost);

    // Create mission
    bytes32 missionId = keccak256('BasicMission', block.number, _sellerId, _buyerId, nonce++);
    missions[missionId] = Mission({
      seller: _sellerId,
      buyer: _buyerId,
      cost: _cost,
      balance: _cost,
      isSigned: false // TODO: Maybe use to approve fulfillment
    });

    // Event
    Create(missionId, _sellerId, _buyerId);
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

    // designate mission as signed
    missions[_missionId].isSigned = true;
    // TODO: trunsfer funds from mission balance to seller

    // Event
    Signed(_missionId);
  }

}
