const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
};

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  const accounts = await ethers.getSigners();

  const {chainId} = await ethers.provider.getNetwork()
  console.log("Using chainId : " , chainId)

  const Dapp = await ethers.getContractAt('Token', config[chainId].Dapp.address);
  console.log('Dapp Token fetched :', Dapp.address);

  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address);
  console.log('mETH Token fetched :', mETH.address);

  const mDai = await ethers.getContractAt('Token',config[chainId].mDAI.address);
  console.log('mDai Token fetched :', mDai.address);

  const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address);
  console.log('Exchange deployed address :', exchange.address);

  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(10000);

  let transaction, result;
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log('Transferred ',amount,'tokens from ', sender.address,' to',receiver.address, '\n');

  const user1 = accounts[0];
  const user2 = accounts[1];
  amount = tokens(1000);

  transaction = await Dapp.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log('Approved ', amount, ' tokens from ', user1.address);

  transaction = await exchange.connect(user1).depositToken(Dapp.address, amount);
  await transaction.wait();
  console.log('Deposited ', amount, ' Ether from ', user1.address, '\n');

  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log('Approved ', amount, ' tokens from ', user2.address);

  transaction = await exchange.connect(user2).depositToken(mETH.address, amount);
  await transaction.wait();
  console.log('Deposited ', amount, ' Ether from ', user2.address, '\n');

  //user1 makes order to get tokens
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(5));
  result = await transaction.wait();
  //console.log('result - Make order :: ', result.events[0].args);
  console.log('1. Make order from ', user1.address);


  //user1 cancels order
  orderId = result.events[0].args.id;
  console.log("order id = " , orderId)
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log('Cancelled order from ', user1.address)

  await wait(1)

  //Seed filled orders
  //user 1 make order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(10));
  result = await transaction.wait();  
  console.log('Make order from ', user1.address);

  //user 2 fills order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log('Filled order from ', user1.address, '\n');

  await wait(1);

  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), Dapp.address, tokens(15));
  result = await transaction.wait();
  console.log('Make order from ', user1.address);

  //user 2 fills order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log('Filled order from ', user1.address, '\n');

  await wait(1);

  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), Dapp.address, tokens(20));
  result = await transaction.wait();
  console.log('Make order from ', user1.address);

  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log('Filled order from ', user1.address, '\n');
  await wait(1);

  //Seed Open orders
  //User 1 makes 10 orders
  for (let i=1;i<=10;i++){
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), Dapp.address, tokens(10) )
    result = await transaction.wait()
    console.log('Make order from ', user1.address)
    await wait(1)
  }


//User 2 makes 10 orders
  for (let i=1;i<=10;i++){
    transaction = await exchange.connect(user2).makeOrder(Dapp.address, tokens(10), mETH.address, tokens(10 * i) )
    result = await transaction.wait()
    console.log('Make order from ', user2.address)
    await wait(1)
  }


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
