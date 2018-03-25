var DAVToken = artifacts.require('./DAVToken.sol');
var Identity = artifacts.require('./Identity.sol');
var BasicMission = artifacts.require('./BasicMission.sol');

module.exports = async (deployer) => {
  deployer.deploy(BasicMission, Identity.address, DAVToken.address);
};
