const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
};

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  const accounts = await ethers.getSigners();

  const Dapp = await ethers.getContractAt(
    'Token',
    '0x0B306BF915C4d645ff596e518fAf3F9669b97016'
  );
  console.log('Dapp Token fetched :', Dapp.address);

  const mETH = await ethers.getContractAt(
    'Token',
    '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1'
  );
  console.log('mETH Token fetched :', mETH.address);

  const mDai = await ethers.getContractAt(
    'Token',
    '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE'
  );
  console.log('mDai Token fetched :', mDai.address);

  const exchange = await ethers.getContractAt(
    'Exchange',
    '0x9A676e781A523b5d0C0e43731313A708CB607508'
  );
  console.log('Exchange deployed address :', exchange.address);

  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(10000);

  let transaction, result;
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log(
    'Transferred ',
    amount,
    'tokens from ',
    sender.address,
    ' to',
    receiver.address,
    '\n'
  );

  const user1 = accounts[0];
  const user2 = accounts[1];
  amount = tokens(1000);

  transaction = await Dapp.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log('Approved ', amount, ' tokens from ', user1.address);

  transaction = await exchange
    .connect(user1)
    .depositToken(Dapp.address, amount);
  await transaction.wait();
  console.log('Deposited ', amount, ' Ether from ', user1.address, '\n');

  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log('Approved ', amount, ' tokens from ', user2.address);

  transaction = await exchange
    .connect(user2)
    .depositToken(mETH.address, amount);
  await transaction.wait();
  console.log('Deposited ', amount, ' Ether from ', user2.address, '\n');

  //user1 makes order to get tokens
  let orderId;
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), Dapp.address, tokens(5));
  result = await transaction.wait();
  console.log('Make order from ', user1.address);

  //user1 cancels order
  orderId = result.events[0].args.orderId;
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log('Cancelled order from ', user1.address);

  await wait(1);

  //send filled orders
  //user 1 make order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), Dapp.address, tokens(10));
  result = await transaction.wait();
  console.log('Make order from ', user1.address);
  //user 2 fills order
  orderId = result.events[0].args.orderId;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log('Filled order from ', user1.address, '\n');

  await wait(1);

  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(50), Dapp.address, tokens(15));
  result = await transaction.wait();
  console.log('Make order from ', user1.address);
  //user 2 fills order
  orderId = result.events[0].args.orderId;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log('Filled order from ', user1.address, '\n');

  await wait(1);

  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(200), Dapp.address, tokens(20));
  result = await transaction.wait();
  console.log('Make order from ', user1.address);

  orderId = result.events[0].args.orderId;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log('Filled order from ', user1.address, '\n');
  await wait(1);

  //Seed Open orders
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
