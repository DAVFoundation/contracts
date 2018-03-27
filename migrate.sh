ganache-cli -d&
sleep 5
truffle migrate
trap : TERM INT;
sleep infinity &
wait
