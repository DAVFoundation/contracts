const accounts = web3.eth.accounts;

const signMessage = (davId) => {
  const msg = 'DAV Identity Registration';
  const hash = web3.sha3(msg);
  let signature = web3.eth.sign(davId, hash).substr(2);
  console.log(davId);
  return {
    id: davId,
    r: '0x' + signature.slice(0, 64),
    s: '0x' + signature.slice(64, 128),
    v: web3.toDecimal(signature.slice(128, 130)) + 27
  };
};

const sampleIdentities = [
  signMessage(accounts[0]),
  signMessage(accounts[1])
];

const registerIdentity = (
  contract,
  walletAddress,
  id = sampleIdentities[0].id,
  v = sampleIdentities[0].v,
  r = sampleIdentities[0].r,
  s = sampleIdentities[0].s,
) => contract.register(id, walletAddress, v, r, s);

module.exports = {
  sampleIdentities,
  registerIdentity,
};
