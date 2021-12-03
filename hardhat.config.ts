import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';

task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      gasPrice: 6666666666666,
    },
    hardhat: {
      fork: {
        url: 'https://eth-mainnet.alchemyapi.io/v2/zymuUVvGMWvAjPYmEXYtobzG802M6X5k',
      },
    },
    testnet: {
      url: 'https://speedy-nodes-nyc.moralis.io/62f6c5db40c169f0b46820cc/bsc/testnet',
      chainId: 97,
      accounts: [
        '4b56d20997b96eab45bb006f679b661849c237804e483ccdcebc95fe1246b8d1',
      ],
    },
  },
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  paths: {
    sources: './src/contracts',
    tests: './src/tests',
    cache: './cache',
    artifacts: './src/abi',
  },
  mocha: {
    timeout: 20000,
  },
};
