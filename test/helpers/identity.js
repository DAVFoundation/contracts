const sampleIdentities = [
  {
    address: '0x17325a469aef3472aa58dfdcf672881d79b31d58',
    v: 28,
    r: '0x092851aac67ddb02c0bd976142f66c937d920fee4dbb305890452b67abb1b9b8',
    s: '0x12f6f410abbb099561c5018f4fc5d9ad7a4c5c2a6f01c594f66a3a243bc7f713',
    invalidR:
      '0x092851aac67ddb02c0bd976142f66c937d920fee4dbb305890452b67abb1b9b0',
  },
  {
    address: '0xd589a93099eeb68ab5670de6940cacc3f7d9ebb3',
    v: 27,
    r: '0xa796e229bce021038f991df21e39a50cc180cd560b9dba4e41c6d39d4359946e',
    s: '0x37922479ad13bc4c41401919eb28c6ed40531d3a971078fd94f1fa9aa540c14b',
  },
];

const registerIdentity = (
  contract,
  walletAddress,
  address = sampleIdentities[0].address,
  v = sampleIdentities[0].v,
  r = sampleIdentities[0].r,
  s = sampleIdentities[0].s,
) => contract.register(address, walletAddress, v, r, s);

module.exports = {
  sampleIdentities,
  registerIdentity,
};
