pragma solidity ^0.4.18;


contract IDAVToken {

  function name() public view returns (string) {}
  function symbol() public view returns (string) {}
  function decimals() public view returns (uint8) {}
  function totalSupply() public view returns (uint256);
  function balanceOf(address who) public view returns (uint256);
  function allowance(address _owner, address _spender) public view returns (uint256);
  function transfer(address _to, uint256 _value) public returns (bool success);
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
  function approve(address _spender, uint256 _value) public returns (bool success);
  function increaseApproval(address _spender, uint _addedValue) public returns (bool success);
  function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool success);

  function owner() public view returns (address) {}
  function transferOwnership(address newOwner) public;

  function mintingFinished() public view returns (bool) {}
  function mint(address _to, uint256 _amount) public returns (bool);
  function finishMinting() public returns (bool);

  function burn(uint256 _value) public;

  function paused() public view returns (bool) {}
  function pause() public;
  function unpause() public;

}
