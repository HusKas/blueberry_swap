import { run, ethers, network } from 'hardhat';

//network.provider.send('hardhat_reset');
async function main() {
  await run('compile');

  let Factory: any, factory: any;
  let ExchangeLibrary: any, exchangeLibrary: any;
  let Blueberry: any, blueberry: any;
  let WETH: any, weth: any;
  let Router: any, router: any;
  let owner: any, investor1: any, investor2: any;
  /**
   * Initializing the total supply and deploing the contracts
   */
  [owner, investor1, investor2] = await ethers.getSigners();

  WETH = await ethers.getContractFactory('WETH');
  weth = await WETH.deploy();
  await weth.deployed();

  ExchangeLibrary = await ethers.getContractFactory('ExchangeLibrary');
  exchangeLibrary = await ExchangeLibrary.deploy();
  await exchangeLibrary.deployed();

  Factory = await ethers.getContractFactory('BlueberryFactory');
  factory = await Factory.deploy();
  await factory.deployed();

  Router = await ethers.getContractFactory('BlueberryRouter');
  router = await Router.deploy(factory.address, weth.address);
  await router.deployed();

  Blueberry = await ethers.getContractFactory('Blueberry');
  blueberry = await Blueberry.deploy();
  await blueberry.deployed();

  console.log(`Blueberry is deployed to: ${blueberry.address}`);
  console.log(`WETH is deployed to: ${weth.address}`);
  console.log(`ExchangeLibrary is deployed to: ${exchangeLibrary.address}`);
  console.log(`Factory is deployed to: ${factory.address}`);
  console.log(`Router is deployed to: ${router.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
