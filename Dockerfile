FROM node:9
RUN npm install -g ganache-cli truffle
VOLUME [ "/contracts/build" ]
WORKDIR /contracts
ADD package.json .
ADD migrate.sh .
ADD registerDavIds.js .
ADD mnemonic.js .
ADD truffle.js .
ADD contracts contracts
ADD migrations migrations
RUN npm i
CMD [ "bash","-c","./migrate.sh" ]
EXPOSE 8545
