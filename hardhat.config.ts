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
    },
    hardhat: {},
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/979cc13a2acf45fb8d615538c822c872',
      accounts: [
        '9636cf32a019e6fe5c45283122f7a47aa41e3438498c1d1e8b2042369fba523e',
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
