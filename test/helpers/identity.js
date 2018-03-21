const sampleIdentities = [
  {
    id: '0x627306090abab3a6e1400e9345bc60c78a8bef57',
    v: 27,
    r: '0x5883b64352addfbe12dcd49b2b1e57d19f612f5a621db1ebd634766294b9f2eb',
    s: '0x1c90d3d14f9d95389f1653ce1e976fd8436fa99e281f01deb32fdbdb4d1705d1',
    invalidR:
      '0x092851aac67ddb02c0bd976142f66c937d920fee4dbb305890452b67abb1b9b0',
  },
  {
    id: '0xf17f52151ebef6c7334fad080c5704d77216b732',
    v: 27,
    r: '0xcde591852c2cb8558e669d010f002f0fa74ea5b04fde87aecb8cd2d515dbb7fe',
    s: '0x4c178848ddaa5e7226e2877fd8fa64727564bd78ba6ca9538d60fb37d11f4ca6',
  },
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
