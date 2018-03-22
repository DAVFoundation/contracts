const ether = require('../helpers/ether');

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const DAVToken = artifacts.require('./mocks/DAVTokenMock.sol');
const DAVCrowdsale = artifacts.require('./DAVCrowdsale.sol');

contract('DAVCrowdsale', function(accounts) {

  const owner = accounts[1];
  const bank = accounts[2];
  const buyer = accounts[3];
  const rate = new BigNumber(10000);
  const value = ether(0.2);
  const expectedTokenAmount = rate.mul(value);

  let token;
  let crowdsale;

  beforeEach(async () => {
    token = await DAVToken.new();
    crowdsale = await DAVCrowdsale.new(rate, bank, token.address, { from: owner });
    await token.transferOwnership(crowdsale.address);
  });

  describe('fallback function', () => {
    it('should accept payments', async () => {
      await crowdsale.sendTransaction({ from: buyer, value }).should.be.fulfilled;
    });

    it('should assign tokens to sender', async () => {
      await crowdsale.sendTransaction({ from: buyer, value }).should.be.fulfilled;
      const balance = await token.balanceOf(buyer);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async () => {
      const pre = web3.eth.getBalance(bank);
      await crowdsale.sendTransaction({ from: buyer, value }).should.be.fulfilled;
      const post = web3.eth.getBalance(bank);
      post.minus(pre).should.be.bignumber.equal(value);
    });

    it('should log purchase', async () => {
      const { logs } = await crowdsale.sendTransaction({ from: buyer, value });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(buyer);
      event.args.beneficiary.should.equal(buyer);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });
  });

  describe('buyTokens()', () => {
    it('should accept payments', async () => {
      await crowdsale.buyTokens(buyer, { from: buyer, value }).should.be.fulfilled;
    });

    xit('should assign tokens to beneficiary', async () => {});
    xit('should forward funds to wallet', async () => {});
    xit('should log purchase', async () => {});
  });

  describe('pause()', () => {
    xit('should be pausable', async () => {});
  });

  describe('unpause()', () => {
    xit('should be unpausable', async () => {});
  });
});
