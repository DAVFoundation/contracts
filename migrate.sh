#!/bin/bash
ganache-cli -d&
sleep 5
truffle migrate
./registerDavIds.js
trap : TERM INT;
sleep infinity &
wait
