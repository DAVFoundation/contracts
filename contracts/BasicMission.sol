pragma solidity ^0.4.15;

import './Identity.sol';


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
    string seller;
    string buyer;
    uint256 cost;
    uint256 balance;
    bool isSigned;
    mapping (uint8 => bool) resolvers;
  }

  mapping (bytes32 => Mission) private missions;

  event Create(
    bytes32 id,
    string sellerId,
    string buyerId
  );

  Identity private identity;

  /**
   * @dev Constructor
   *
   * @param _identityContract address of the Identity contract
   */
  function BasicMission(Identity _identityContract) public {
    identity = _identityContract;
  }

  /**
  * @notice Create a new mission
  * @param _sellerId The DAV Identity of the person providing the service
  * @param _buyerId The DAV Identity of the person ordering the service
  * @param _cost The total cost of the mission to be paid by buyer
  */
  function create(string _sellerId, string _buyerId, uint256 _cost) public {
    // @TODO: Verify that sender controls the seller's wallet

    // Create mission
    bytes32 missionId = keccak256('BasicMission', block.number, _sellerId, _buyerId, nonce++);
    missions[missionId] = Mission({
      seller: _sellerId,
      buyer: _buyerId,
      cost: _cost,
      balance: 0,
      isSigned: false
    });

    // Event
    Create(missionId, _sellerId, _buyerId);
  }

}
