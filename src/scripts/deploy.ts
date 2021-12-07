import { run, ethers, network } from 'hardhat';

network.provider.send('hardhat_reset');
async function main() {
  await run('compile');

  let Factory: any, factory: any;
  let ExchangeLibrary: any, exchangeLibrary: any;
  let Token1: any,
    token1: any,
    Token2: any,
    token2: any,
    Token3: any,
    token3: any,
    Token4: any,
    token4: any;
  let WETH: any, weth: any;
  let Router: any, router: any;
  let owner: any, investor1: any, investor2: any;
  /**
   * Initializing the total supply and deploing the contracts
   */
  [owner, investor1, investor2] = await ethers.getSigners();

  Token1 = await ethers.getContractFactory('Token1');
  token1 = await Token1.deploy('Blue1', 'Blue1', '1000000000000000000000000');
  await token1.deployed();

  Token2 = await ethers.getContractFactory('Token2');
  token2 = await Token2.deploy('Blue2', 'Blue2', '1000000000000000000000000');
  await token2.deployed();

  Token3 = await ethers.getContractFactory('Token3');
  token3 = await Token3.deploy();
  await token3.deployed();

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

  console.log(`Token1 is deployed to: ${token1.address}`);
  console.log(`Token2 is deployed to: ${token2.address}`);
  console.log(`Token3 is deployed to: ${token3.address}`);
  console.log(`ExchangeLibrary is deployed to: ${exchangeLibrary.address}`);
  console.log(`WETH is deployed to: ${weth.address}`);
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
