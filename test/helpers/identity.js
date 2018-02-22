const sampleIdentities = [
  {
    address: '0x17325a469aef3472aa58dfdcf672881d79b31d58',
    v: 28,
    r: '0x092851aac67ddb02c0bd976142f66c937d920fee4dbb305890452b67abb1b9b8',
    s: '0x12f6f410abbb099561c5018f4fc5d9ad7a4c5c2a6f01c594f66a3a243bc7f713',
    invalidR: '0x092851aac67ddb02c0bd976142f66c937d920fee4dbb305890452b67abb1b9b0',
  }
];

const registerIdentity = (contract, walletAddress, address = sampleIdentities[0].address, v = sampleIdentities[0].v, r = sampleIdentities[0].r, s = sampleIdentities[0].s) =>
  contract.register(address, walletAddress, v, r, s);


module.exports = {
  sampleIdentities,
  registerIdentity,
};
