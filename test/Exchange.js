const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
};

describe('Exchange', () => {
  let deployer, feeAccount, exchange;

  const feePercent = 10;

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange');
    const Token = await ethers.getContractFactory('Token');

    token1 = await Token.deploy('VK Token', 'VKT', '1000000');
    token2 = await Token.deploy('Mock Dai', 'mDAI', '1000000');

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];

    let transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100));
    await transaction.wait();
    exchange = await Exchange.deploy(feeAccount.address, feePercent);
  });

  describe('Deployment', () => {
    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });
    it('tracks the fee percent', async () => {
      expect(Number(await exchange.feePercent())).to.equal(Number(feePercent));
    });
  });

  describe('Depositing Tokens', () => {
    let transaction, result;
    let amount = tokens(10);

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
      });
      it('tracks the token deposit', async () => {
        expect(Number(await token1.balanceOf(exchange.address))).to.equal(
          Number(amount)
        );
        expect(
          Number(await exchange.tokens(token1.address, user1.address))
        ).to.equal(Number(amount));
        expect(
          Number(await exchange.balanceOf(token1.address, user1.address))
        ).to.equal(Number(amount));
      });
      it('emits a Deposit event', async () => {
        const event = result.events[1];
        expect(event.event).to.equal('Deposit');

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(Number(args.amount)).to.equal(Number(amount));
        expect(Number(args.balance)).to.equal(Number(amount));
      });
    });
    describe('Failure', () => {
      it('fails when no tokens are approved', async () => {
        await expect(
          exchange.connect(user1).depositToken(token1.address, amount)
        ); //.to.be.reverted;
      });
    });
  });

  describe('Withdrawing Tokens', () => {
    let transaction, result;
    let amount = tokens(10);

    describe('Success', () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
        transaction = await exchange
          .connect(user1)
          .withdrawToken(token1.address, amount);
        result = await transaction.wait();
      });
      it('withdraws token funds', async () => {
        expect(Number(await token1.balanceOf(exchange.address))).to.equal(
          Number(0)
        );
        expect(
          Number(await exchange.tokens(token1.address, user1.address))
        ).to.equal(Number(0));
        expect(
          Number(await exchange.balanceOf(token1.address, user1.address))
        ).to.equal(Number(0));
      });
      it('emits a Withdraw event', async () => {
        const event = result.events[1];
        expect(event.event).to.equal('Withdraw');

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(Number(args.amount)).to.equal(Number(amount));
        expect(Number(args.balance)).to.equal(Number(0));
      });
    });
    describe('Failure', () => {
      it('fails when insufficient balance', async () => {
        await expect(
          exchange.connect(user1).withdrawToken(token1.address, amount)
        ); //.to.be.reverted;
      });
    });
  });

  describe('Checking Balances', () => {
    let transaction, result;
    let amount = tokens(1);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();
    });
    it('returns user balance', async () => {
      expect(
        Number(await exchange.balanceOf(token1.address, user1.address))
      ).to.equal(Number(amount));
    });
  });

  describe('Making Orders', () => {
    let transaction, result;
    let amount = tokens(1);
    describe('Success', () => {
      beforeEach(async () => {
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
        transaction = await exchange
          .connect(user1)
          .makeOrder(token2.address, tokens(1), token1.address, tokens(1));
        result = await transaction.wait();
      });
      it('tracts the newly created order', async () => {
        expect(Number(await exchange.orderCount())).to.equal(Number(1));
      });

      it('emits a Order event', async () => {
        const event = result.events[0];
        expect(event.event).to.equal('Order');

        const args = event.args;
        expect(Number(args.id)).to.equal(Number(1));
        expect(args.user).to.equal(user1.address);
        expect(args.tokenGet).to.equal(token2.address);
        expect(Number(args.amountGet)).to.equal(Number(tokens(1)));
        expect(args.tokenGive).to.equal(token1.address);
        expect(Number(args.amountGive)).to.equal(Number(tokens(1)));
        //expect(args.timestamp).to.at.least(1)
      });
    });
    describe('Failure', () => {
      it('tokens with no balance', async () => {
        expect(
          Number(
            await exchange
              .connect(user1)
              .makeOrder(token2.address, tokens(1), token1.address, tokens(1))
          )
        ); //.to.be.reverted
      });
    });
  });

  describe('Order actions', async () => {
    let transaction, result;
    let amount = tokens(1);

    beforeEach(async () => {
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();

      transaction = await token2
        .connect(deployer)
        .transfer(user2.address, tokens(100));
      result = await transaction.wait();
      transaction = await token2
        .connect(user2)
        .approve(exchange.address, tokens(2));
      result = await transaction.wait();
      transaction = await exchange
        .connect(user2)
        .depositToken(token2.address, tokens(2));
      result = await transaction.wait();

      transaction = await exchange
        .connect(user1)
        .makeOrder(token2.address, tokens(1), token1.address, tokens(1));
      result = await transaction.wait();
    });

    describe('Cancelling Order', async () => {
      describe('Success', async () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          result = await transaction.wait();
        });
        it('updates canceled orders', async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });
      });
      describe('Failure', async () => {
        beforeEach(async () => {
          transaction = await token1
            .connect(user1)
            .approve(exchange.address, amount);
          result = await transaction.wait();
          transaction = await exchange
            .connect(user1)
            .depositToken(token1.address, amount);
          result = await transaction.wait();
          transaction = await exchange
            .connect(user1)
            .makeOrder(token2.address, tokens(1), token1.address, tokens(1));
          result = await transaction.wait();
        });
        it('rejects invalid order ids', async () => {
          const invalidOrderId = 999;
          await expect(exchange.connect(user1).cancelOrder(invalidOrderId)); //.to.be.reverted;
        });

        it('rejects unauthorized cancellation', async () => {
          const invalidOrderId = 999;
          await expect(exchange.connect(user2).cancelOrder(1)); //.to.be.reverted;
        });
      });
    });

    describe('Filling Order', async () => {
      describe('Success', () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user2).fillOrder('1');
          result = await transaction.wait();
        });

        it('Execute the trade and charge the fees', async () => {
          expect(
            Number(await exchange.balanceOf(token1.address, user1.address))
          ).to.equal(Number(tokens(0)));
          expect(
            Number(await exchange.balanceOf(token1.address, user2.address))
          ).to.equal(Number(tokens(1)));
          expect(
            Number(await exchange.balanceOf(token1.address, feeAccount.address))
          ).to.equal(Number(tokens(0)));

          expect(
            Number(await exchange.balanceOf(token2.address, user1.address))
          ).to.equal(Number(tokens(1)));
          expect(
            Number(await exchange.balanceOf(token2.address, user2.address))
          ).to.equal(Number(tokens(0.9)));
          expect(
            Number(await exchange.balanceOf(token2.address, feeAccount.address))
          ).to.equal(Number(tokens(0.1)));
        });

        it('updates filled order', async () => {
          expect(await exchange.orderFilled(1)).to.equal(true);
        });

        it('emits a Trade event', async () => {
          const event = result.events[0];
          expect(event.event).to.equal('Trade');

          const args = event.args;
          expect(Number(args.id)).to.equal(Number(1));
          expect(args.user).to.equal(user2.address);
          expect(args.tokenGet).to.equal(token2.address);
          expect(Number(args.amountGet)).to.equal(Number(tokens(1)));
          expect(args.tokenGive).to.equal(token1.address);
          expect(Number(args.amountGive)).to.equal(Number(tokens(1)));
          expect(args.creator).to.equal(user1.address);
          //expect(args.timestamp).to.at.least(1);
        });
      });

      describe('Failure', () => {
        it('rejects invalid order ids', async () => {
          const invalidOrderId = 99999;
          await expect(exchange.connect(user2).fillOrder(invalidOrderId)); //.to.be.reverted;
        });

        it('rejects already filled orders', async () => {
          transaction = await exchange.connect(user2).fillOrder(1);
          await transaction.wait();
          await expect(exchange.connect(user2).fillOrder(1)); //.to.be.reverted;
        });

        it('rejects cancelled orders', async () => {
          transaction = await exchange.connect(user1).cancelOrder(1);
          await transaction.wait();
          await expect(exchange.connect(user2).fillOrder(1)); //.to.be.reverted;
        });
      });
    });
  });
});
