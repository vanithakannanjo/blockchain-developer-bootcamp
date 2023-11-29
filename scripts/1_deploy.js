async function main() {
  console.log('Preparing deployment .....');
  //Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token');
  const Exchange = await ethers.getContractFactory('Exchange');

  const accounts = await ethers.getSigners();
  console.log(
    'Accounts fetched : \n',
    accounts[0].address,
    '\n',
    accounts[1].address,
    '\n'
  );
  //Deploy contracts
  const dapp = await Token.deploy('DAPP Token', 'DAPP', '1000000');
  await dapp.deployed();
  console.log(`DAPP Token Deployed to : ${dapp.address}`);

  const mETH = await Token.deploy('mETH', 'mETH', '1000000');
  await mETH.deployed();
  console.log(`mETH Token Deployed to : ${mETH.address}`);

  const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000');
  await mDAI.deployed();
  console.log(`mDAI Token Deployed to : ${mDAI.address}`);

  const exchange = await Exchange.deploy(accounts[1].address, 10);
  await exchange.deployed();
  console.log(`Exchange Deployed to : ${exchange.address}`);
}

/*
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
