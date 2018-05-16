build:
	docker build --tag 'dav-contracts' .

start: build
	docker run --rm --name 'dav-contracts' -p 8545:8545 --network='dav' -it -v $${PWD}/build:/contracts/build dav-contracts

start-bg: build
	docker run --rm --name 'dav-contracts' -p 8545:8545 --network='dav' -d -v $${PWD}/build:/contracts/build dav-contracts

stop:
	docker kill dav-contracts
