const fs = require('fs');

module.exports = function deploy(
  ethNetworkId,
  web3,
  ownerAddress,
  contract,
  params,
  artifactFile,
) {
  return new Promise((resolve, reject) => {
    let lastTxHash = '';
    const Web3Contract = new web3.eth.Contract(contract.abi);
    Web3Contract.deploy({
      data: contract.bytecode,
      arguments: params,
    })
      .send(
        {
          from: ownerAddress,
          gas: 6712388,
          gasPrice: '15000000000',
        },
        (error, transactionHash, a) => {
          console.log('callback', error, transactionHash, a);
          if (error) {
            console.log(error);
            reject(error);
          }
          lastTxHash = transactionHash;
        },
      )
      .then(instance => {
        if (!contract.networks.hasOwnProperty(ethNetworkId)) {
          contract.networks[ethNetworkId] = {
            events: {},
            links: {},
            transactionHash: lastTxHash,
          };
        }
        contract.networks[ethNetworkId].address = instance.options.address;
        console.log(contract.contractName, instance.options.address);
        let json = JSON.stringify(contract); //convert it back to json
        fs.writeFileSync(`${__dirname}/${artifactFile}`, json);
        resolve(contract);
      })
      .catch(err => {
        reject(err);
      });
  });
};
