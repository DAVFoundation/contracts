var DAVToken = artifacts.require('./DAVToken.sol');
var Identity = artifacts.require('./Identity.sol');
var BasicMission = artifacts.require('./BasicMission.sol');

module.exports = async (deployer) => {
  await deployer.deploy(DAVToken);
  deployer.deploy(Identity, DAVToken.address);
  deployer.deploy(BasicMission);
};
