build:
	docker build --tag 'dav-contracts' .

start: build
	docker run --rm --name 'dav-contracts' -p 8545:8545 -it -v $${PWD}:/contracts dav-contracts
