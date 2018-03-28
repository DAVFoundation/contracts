FROM node:9
RUN npm install -g ganache-cli truffle
VOLUME [ "/contracts" ]
WORKDIR /contracts
CMD [ "bash","-c","./migrate.sh" ]
EXPOSE 8545
