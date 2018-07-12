pragma solidity 0.4.24;

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
    uint256 tokenAmount;
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
   * @param _tokenAmount The amount of tokens to be burned when mission is completed
   */
  function create(bytes32 _missionId, address _sellerId, address _buyerId, uint256 _tokenAmount) public payable {
    // Verify that message sender controls the buyer's wallet
    require(
      identity.verifyOwnership(_buyerId, msg.sender)
    );

    // Verify buyer's balance is sufficient
    require(
      identity.getBalance(_buyerId) >= _tokenAmount
    );

    // Make sure id isn't registered already
    require(
      missions[_missionId].buyer == 0x0
    );

    // Transfer tokens to the mission contract
    token.transferFrom(msg.sender, this, _tokenAmount);

    // Create mission
    missions[_missionId] = Mission({
      seller: _sellerId,
      buyer: _buyerId,
      tokenAmount: _tokenAmount,
      cost: msg.value,
      balance: msg.value,
      isSigned: false
    });

    // Event
    emit Create(_missionId, _sellerId, _buyerId);
  }

  /**
  * @notice Fund a mission
  * @param _missionId The id of the mission
  */
  function fulfilled(bytes32 _missionId) public {
    // Verify that message sender controls the seller's wallet
    require(
      identity.verifyOwnership(missions[_missionId].buyer, msg.sender)
    );
    
    require(
      missions[_missionId].isSigned == false
    );

    require(
      missions[_missionId].balance == missions[_missionId].cost
    );
    
    require(
      address(this).balance >= missions[_missionId].cost
    );
    
    // designate mission as signed
    missions[_missionId].isSigned = true;
    missions[_missionId].balance = 0;
    token.burn(missions[_missionId].tokenAmount);

    // transfer ETH to seller
    identity.getIdentityWallet(missions[_missionId].seller).transfer(missions[_missionId].cost);

    // Event
    emit Signed(_missionId);
  }

}
