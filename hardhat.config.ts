import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, './.env') });

task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
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
    testnet: {
      url: 'https://speedy-nodes-nyc.moralis.io/69616cb06e43d4b548b65d83/bsc/testnet',
      chainId: 97,
      accounts: [process.env.TEST_NET_KEY],
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
