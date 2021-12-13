import React, { Component } from 'react';
import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address, getAddress } from '@ethersproject/address';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3Modal from 'web3modal';
import './App.css';
import Navbar from './Navbar';
import SwapTokens from './SwapTokens';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Exchange from '../abi/src/contracts/BlueberryExchange.sol/BlueberryExchange.json';
import Factory from '../abi/src/contracts/BlueberryFactory.sol/BlueberryFactory.json';
import Router from '../abi/src/contracts/BlueberryRouter.sol/BlueberryRouter.json';
import WETH from '../abi/src/contracts/WETH.sol/WETH.json';
import ERC20 from '../abi/src/contracts/BlueberryERC20.sol/BlueberryERC20.json';
import { BigNumber, ethers, Contract } from 'ethers';
import Context from './Context';
import { Modal } from '../components/Modalform';
import { IApp, ITokenData } from '../components/IStates/IApp';
import styled from 'styled-components';
import { Tabs } from './Tabs';
import AddLiquidity from './Liquidity';
import data from '../data.json';
import { ModalSlippage } from './ModalSlippage';
import {
  REACT_APP_ZERO_ADDRESS,
  REACT_APP_BLUEBERRY_ADDRESS,
  REACT_APP_WETH_ADDRESS,
  REACT_APP_FACTORY_ADDRESS,
  REACT_APP_ROUTER_ADDRESS,
  INIT_CODE_HASH,
} from './shared';

declare let window: any;

const ContainerLink = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  margin: 10px;
  border: 1px solid white;
  border-radius: 10px;
`;
const Link = styled.a`
  margin: 10px;
  color: white;
`;

const Msg = styled.div`
  height: 35px;
  position: relative;
  top: -50px;
  color: white;
  border-radius: 25px;
  text-align: center;
`;

const MsgInner = styled.div`
  padding: 15px;
  color: white;
  border: 1px solid white;
  border-radius: 25px;
`;

export const computePairAddress = ({
  factoryAddress,
  tokenA,
  tokenB,
}: {
  factoryAddress: string;
  tokenA: ITokenData;
  tokenB: ITokenData;
}): string => {
  const [token0, token1] =
    tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
  return getCreate2Address(
    factoryAddress,
    keccak256(
      ['bytes'],
      [pack(['address', 'address'], [token0.address, token1.address])]
    ),
    INIT_CODE_HASH
  );
};

class App extends Component<any, IApp> {
  _isMounted = false;
  child: any;
  overrides = {
    gasLimit: 9999999,
  };

  constructor(props: any) {
    super(props);
    this.child = React.createRef() || '';

    this.state = {
      account: '',
      web3: new Web3(Web3.givenProvider),
      router: {} as Contract,
      factory: {} as Contract,
      exchange: {} as Contract,
      Pair: {} as Contract,
      tokenABalance: '0',
      tokenBBalance: '0',
      tokenABalanceInWei: BigNumber.from(0),
      tokenBBalanceInWei: BigNumber.from(0),
      loading: false,
      loadingRemoveLp: false,
      provider: {},
      signer: {},
      exchangeAddress: '',
      swapTokens: this.swapTokens,
      addLiquidity: this.addLiquidity,
      removeLiquidity: this.removeLiquidity,
      getTokenAAmount: this.getTokenAAmount,
      getTokenAAmountSwitchedForm: this.getTokenAAmountSwitchedForm,
      getTokenBAmountSwitchedForm: this.getTokenBAmountSwitchedForm,
      getTokenBAmount: this.getTokenBAmount,
      getExchangeAddress: this.getExchangeAddress,
      getExchange: this.getExchange,
      getLiquidityOwner: this.getLiquidityOwner,
      getPriceImpactAToken: this.getPriceImpactAToken,
      getPriceImpactBToken: this.getPriceImpactBToken,
      fromWei: this.fromWei,
      toWei: this.toWei,
      isOpen: false,
      isOpenModalSlippage: false,
      toggleSlippageModal: this.toggleSlippageModal,
      toggleTokenListModal: this.toggleTokenListModal,
      tokensData: [] as ITokenData[],
      tokensGData: [] as ITokenData[],
      tokenAData: {} as ITokenData,
      tokenBData: {} as ITokenData,
      setMsg: this.setMsg,
      tx: '',
      msg: false,
      msgTxt: '',
      outputAddress: '',
      liquidity: BigNumber,
      tokenASelectedShare: '',
      tokenBSelectedShare: '',
      lpPairBalanceAccount: '0',
      lpShareAccountviaInput: '0',
      priceImpact: 0,
      lpAccountShare: 0,
      tokenAShare: 0,
      tokenBShare: 0,
      tokenBSelected: false,
      outputAmount: '',
      outputAmountInWei: '',
      inputAmount: '',
      inputAmountInWei: '',
      setSlippage: this.setSlippage,
      slippage: '0.1',
      clearStates: this.clearStates,
      networkName: '',
      correctNetwork: false,
      switched: false,
      connectToWeb3: this.connectToWeb3,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.setState({
      tokensData: data,
      tokenAData: data[0],
      tokensGData: data,
    });
    const networkActive = window.localStorage.getItem('networkActive');
    if (networkActive) {
      await this.loadBlockchainData();
      await this.getLiquidityOwner(
        this.state.tokenAData,
        this.state.tokenBData
      );
    }
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    if (prevState.account !== this.state.account) {
      await this.getLiquidityOwner(
        this.state.tokenAData,
        this.state.tokenBData
      );
    }
  }

  connectToWeb3 = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider || window.ethereum) {
        const providerOptions = {
          /* See Provider Options Section */
          injected: {
            display: {
              logo: 'data:image/png;base64,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',
              name: 'Metamask',
              description: 'Connect with the provider in your Browser',
            },
            package: null,
          },
          // Example with WalletConnect provider
          walletconnect: {
            display: {
              logo: 'data:image/jpeg;base64,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',
              name: 'Mobile',
              description: 'Scan qrcode with your mobile wallet',
            },
            package: WalletConnectProvider,
            options: {
              rpc: {
                56: 'https://bsc-dataseed.binance.org/',
              },
              network: 'binance',
              chainId: 56,
            },
          },
        };
        const web3Modal = new Web3Modal({
          network: 'binance', // optional
          cacheProvider: false, // optional
          providerOptions, // required
        });

        await web3Modal.connect();
        await this.loadBlockchainData();
        await this.getLiquidityOwner(
          this.state.tokenAData,
          this.state.tokenBData
        );
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  async loadBlockchainData() {
    const accounts = await this.state.web3.eth.getAccounts();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const network = await provider.getNetwork();

    window.localStorage.setItem('networkActive', true);

    let networkName: any, correctNetwork: any;
    [networkName, correctNetwork] = await this.getNetworkName(network.name);

    if (correctNetwork) {
      //Router load
      const router = new ethers.Contract(
        this.isAddress(REACT_APP_ROUTER_ADDRESS),
        Router.abi,
        signer
      );

      //Factory load
      const factory = new ethers.Contract(
        this.isAddress(REACT_APP_FACTORY_ADDRESS),
        Factory.abi,
        signer
      );

      this.setState({
        router,
        factory,
        account: accounts[0],
        provider,
        signer,
        networkName,
        correctNetwork,
      });
    } else {
      console.log('Wrong network');
      this.setState({
        account: accounts[0],
        networkName,
        loading: false,
      });
    }

    window.ethereum.on('accountsChanged', async (accounts: any) => {
      // Time to reload your interface with accounts[0]!
      console.log('Account changed..');
      this.setState({
        account: accounts[0],
      });

      if (
        this.state.tokenAData.address ===
          this.isAddress(REACT_APP_WETH_ADDRESS) ||
        this.state.tokenBData.address === this.isAddress(REACT_APP_WETH_ADDRESS)
      ) {
        await this.getEthBalanceTokenA();
        await this.getTokenBBalance(this.state.tokenBData);
      } else {
        await this.getTokenABalance(this.state.tokenAData);
        await this.getTokenBBalance(this.state.tokenBData);
      }
    });

    if (
      this.state.tokenAData.address ===
        this.isAddress(REACT_APP_WETH_ADDRESS) ||
      this.state.tokenBData.address === this.isAddress(REACT_APP_WETH_ADDRESS)
    ) {
      await this.getEthBalanceTokenA();
      await this.getTokenABalance(this.state.tokenAData);
    } else {
      await this.getTokenBBalance(this.state.tokenBData);
      await this.getTokenABalance(this.state.tokenAData);
    }
  }

  getGasLimit = async () => {
    const gasLimit = await this.state.web3.eth.getBlock('latest');
    return gasLimit;
  };

  isAddress(value: any): string {
    try {
      return getAddress(value);
    } catch {
      return null;
    }
  }
  // clear at switching taps or removing input
  clearStates = () => {
    this.setState({
      priceImpact: 0,
      inputAmount: null,
      outputAmount: null,
      outputAmountInWei: null,
      inputAmountInWei: null,
    });
  };

  setSlippage = (slippage: string) => {
    console.log(`setSlippage...${slippage}`);
    this.setState({
      slippage,
    });
  };

  switchForms = async () => {
    console.log('switchForms..');
    await this.switchTokens();
  };

  switchTokens = async () => {
    const tokenADataTmp = this.state.tokenAData;
    this.setState({
      tokenAData: this.state.tokenBData,
      tokenBData: tokenADataTmp,
      switched: !this.state.switched,
    });
  };

  getCalcExchangeAddress = async (tokenA: ITokenData, tokenB: ITokenData) => {
    const REACT_APP_FACTORY_ADDRESS_NEW = this.isAddress(
      REACT_APP_FACTORY_ADDRESS
    );
    return computePairAddress({
      factoryAddress: REACT_APP_FACTORY_ADDRESS_NEW,
      tokenA,
      tokenB,
    });
  };

  getNetworkName = async (network: string) => {
    console.log(network);
    switch (network) {
      case 'bnb':
        return ['Binance Smart Chain', true];
      case 'bnbt':
        return ['Binance Smart Chain Test', true];
      case 'unknown':
        return ['Hardhat Test', true];
      default:
        return ['Wrong Network', false];
    }
  };

  toWei(value: any) {
    return ethers.utils.parseEther(value.toString());
  }

  fromWei(value: any) {
    return ethers.utils.formatEther(
      typeof value === 'string' ? value : value.toString()
    );
  }

  async getEthBalanceTokenA() {
    try {
      let ethBalance: any, ethBalanceInWei: BigNumber;
      ethBalanceInWei = await this.state.provider.getBalance(
        this.state.account
      );
      ethBalance = this.fromWei(ethBalanceInWei).toString();

      this.setState({
        tokenABalance: ethBalance,
        tokenABalanceInWei: ethBalanceInWei,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async getEthBalanceTokenB() {
    try {
      let ethBalance: any, ethBalanceInWei: BigNumber;
      ethBalanceInWei = await this.state.provider.getBalance(
        this.state.account
      );
      ethBalance = this.fromWei(ethBalanceInWei).toString();
      this.setState({
        tokenBBalance: ethBalance,
        tokenBBalanceInWei: ethBalanceInWei,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async getTokenABalance(tokenData: ITokenData) {
    try {
      const token1 = new ethers.Contract(
        tokenData.address,
        ERC20.abi,
        this.state.signer
      );

      let tokenABalance: any, tokenABalanceInWei: any;
      tokenABalanceInWei = await token1.balanceOf(this.state.account);
      tokenABalance = this.fromWei(tokenABalanceInWei).toString();

      this.setState({ tokenABalance, tokenABalanceInWei });
    } catch (err) {
      console.log(err);
      this.setState({ tokenABalance: '0' });
    }
  }

  async getTokenBBalance(tokenData: ITokenData) {
    try {
      const token2 = new ethers.Contract(
        tokenData.address,
        ERC20.abi,
        this.state.signer
      );

      let tokenBBalance: any, tokenBBalanceInWei: any;
      tokenBBalanceInWei = await token2.balanceOf(this.state.account);
      tokenBBalance = this.fromWei(tokenBBalanceInWei).toString();

      this.setState({ tokenBBalance, tokenBBalanceInWei });
    } catch (err) {
      console.log(err);
      this.setState({ tokenBBalance: '0' });
    }
  }

  checkIfBothTokeSelected = async (withMessage: boolean) => {
    if (
      this.state.tokenAData &&
      Object.keys(this.state.tokenAData).length > 0 &&
      this.state.tokenBData &&
      Object.keys(this.state.tokenBData).length > 0
    ) {
      return true;
    } else {
      if (withMessage) {
        console.log('Select a token..');
        this.setMsg('Select a token..');
      }
      this.setState({
        loading: false,
      });
    }
  };

  checkBalances = async (tokenAAmount: BigNumber, tokenBAmount: BigNumber) => {
    if (
      !this.state.switched &&
      this.state.tokenABalanceInWei.gt(tokenAAmount) &&
      this.state.tokenBBalanceInWei.gt(tokenBAmount)
    ) {
      return true;
    } else if (
      this.state.switched &&
      this.state.tokenABalanceInWei.gt(tokenBAmount) &&
      this.state.tokenBBalanceInWei.gt(tokenAAmount)
    ) {
      return true;
    } else {
      console.log('Not enough balance');
      this.state.setMsg('Not enough balance..');
      this.setState({
        loading: false,
      });
    }
  };

  checkValueInputs = async (
    tokenAAmount: BigNumber,
    tokenBAmount: BigNumber
  ) => {
    if (tokenAAmount.gt(0) && tokenBAmount.gt(0)) {
      return true;
    } else {
      console.log('Input fields must not be empty');
      this.state.setMsg('Input fields must not be empty');
      this.setState({
        loading: false,
      });
    }
  };

  checkAllFieldInputs = async (
    tokenAAmount: BigNumber,
    tokenBAmount: BigNumber
  ) => {
    const checkSelectedTokens = await this.checkIfBothTokeSelected(true);
    const checkBalances = await this.checkBalances(tokenAAmount, tokenBAmount);
    const checkValueInputs = await this.checkValueInputs(
      tokenAAmount,
      tokenBAmount
    );
    return checkSelectedTokens && checkBalances && checkValueInputs;
  };

  addLiquidity = async (tokenAAmount: BigNumber, tokenBAmount: BigNumber) => {
    this.setState({ loading: true });
    const checkInputs = await this.checkAllFieldInputs(
      tokenAAmount,
      tokenBAmount
    );
    if (checkInputs) {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      const exchangeAddress = await this.getExchangeAddress(
        this.state.tokenAData.address,
        this.state.tokenBData.address
      );
      console.log(`Token pair - àddLiquidity : ${exchangeAddress}`);

      const token1 = new ethers.Contract(
        this.state.tokenAData.address,
        ERC20.abi,
        this.state.signer
      );

      const token2 = new ethers.Contract(
        this.state.tokenBData.address,
        ERC20.abi,
        this.state.signer
      );
      if (
        this.state.tokenAData.address ===
          this.isAddress(REACT_APP_WETH_ADDRESS) &&
        exchangeAddress !== REACT_APP_ZERO_ADDRESS
      ) {
        try {
          console.log('Adding liquditiy ETH now ...');

          const tx = await token2.approve(
            this.state.router.address,
            tokenBAmount,
            {
              from: this.state.account,
              ...this.overrides,
            }
          );

          await tx.wait(1);

          const tx2 = await this.state.router.addLiquidityETH(
            this.state.tokenBData.address,
            tokenBAmount, //TokenB
            tokenBAmount,
            tokenAAmount,
            this.state.account,
            deadline,
            {
              from: this.state.account,
              value: tokenAAmount, //ETH
              ...this.overrides,
            }
          );
          await tx2.wait(1);

          this.setState({ loading: false, tx: tx2.hash });
          setTimeout(() => {
            this.setState({ tx: null });
          }, 3000);
        } catch (err) {
          this.setState({ loading: false });
        }
      } else if (
        this.state.tokenBData.address ===
          this.isAddress(REACT_APP_WETH_ADDRESS) &&
        exchangeAddress !== REACT_APP_ZERO_ADDRESS
      ) {
        try {
          console.log('Adding liquditiy Token to ETH now ...');

          const tx = await token1.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              ...this.overrides,
            }
          );
          await tx.wait(1);

          const tx2 = await this.state.router.addLiquidityETH(
            this.state.tokenAData.address,
            tokenAAmount, //TokenB
            0,
            0,
            this.state.account,
            deadline,
            {
              from: this.state.account,
              value: tokenBAmount, //ETH
              ...this.overrides,
            }
          );
          await tx2.wait(1);

          this.setState({ loading: false, tx: tx2.hash });
          setTimeout(() => {
            this.setState({ tx: null });
          }, 3000);
        } catch (err) {
          this.setState({ loading: false });
        }
      } else {
        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          try {
            console.log('Adding liquditiy Token to Token now ...');

            const tx0 = await token1.approve(
              this.state.router.address,
              tokenAAmount,
              {
                from: this.state.account,
                ...this.overrides,
              }
            );
            await tx0.wait();

            const tx1 = await token2.approve(
              this.state.router.address,
              tokenBAmount,
              {
                from: this.state.account,
                ...this.overrides,
              }
            );

            await tx1.wait(1);

            const tx2 = await this.state.router.addLiquidity(
              this.state.tokenAData.address,
              this.state.tokenBData.address,
              tokenAAmount,
              tokenBAmount,
              0,
              0,
              this.state.account,
              deadline,
              {
                from: this.state.account,
                ...this.overrides,
              }
            );
            await tx2.wait(1);

            this.setState({ loading: false, tx: tx2.hash });
            setTimeout(() => {
              this.setState({ tx: null });
            }, 3000);
          } catch (err) {
            this.setState({ loading: false });
          }
        }
      }
    }
  };

  removeLiquidity = async (liquidityAmount: any) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    const weth = new ethers.Contract(
      this.isAddress(REACT_APP_WETH_ADDRESS) || '',
      WETH.abi,
      this.state.signer
    );

    const token = new ethers.Contract(
      this.state.tokenBData.address,
      ERC20.abi,
      this.state.signer
    );

    const pairAddress = await this.getCalcExchangeAddress(
      this.state.tokenAData,
      this.state.tokenBData
    );

    const Pair = new ethers.Contract(
      pairAddress,
      Exchange.abi,
      this.state.signer
    );

    const TokenInPair = await token.balanceOf(Pair.address);
    const WETHInPair = await weth.balanceOf(Pair.address);
    const liquidity = await Pair.balanceOf(this.state.account);
    const totalSupply = await Pair.totalSupply();
    const TokenExpected = TokenInPair.mul(liquidity).div(totalSupply);
    const WETHExpected = WETHInPair.mul(liquidity).div(totalSupply);

    try {
      const tx1 = await this.state.Pair.approve(
        this.state.router.address,
        liquidityAmount,
        {
          from: this.state.account,
          ...this.overrides,
        }
      );
      await tx1.wait(1);

      const tx2 =
        await this.state.router.removeLiquidityETHSupportingFeeOnTransferTokens(
          this.state.tokenBData.address,
          liquidityAmount,
          TokenExpected,
          WETHExpected,
          this.state.account,
          deadline,
          {
            from: this.state.account,
            ...this.overrides,
          }
        );
      await tx2.wait(1);

      return true;
    } catch (e: any) {
      console.log(e);
      console.log('Could not remove liquidity');
    }
  };

  getExchange = async (exchangeAddress: string) => {
    console.log('getExchange...');
    try {
      if (
        Object.keys(this.state.signer).length > 0 &&
        exchangeAddress !== undefined
      ) {
        const exchange = new ethers.Contract(
          exchangeAddress,
          Exchange.abi,
          this.state.signer
        );

        return exchange;
      }
    } catch (err) {
      console.log(err);
    }
  };

  getExchangeAddress = async (token1Address: any, token2Address: any) => {
    console.log(this.state.factory.address);

    let exchangeAddress: any;
    try {
      exchangeAddress = await this.state.factory.getPair(
        token1Address,
        token2Address
      );

      return exchangeAddress;
    } catch (err: any) {
      console.log(err);
    }
  };

  swapTokens = async (tokenAAmount: BigNumber, tokenBAmount: BigNumber) => {
    const checkInputs = await this.checkAllFieldInputs(
      tokenAAmount,
      tokenBAmount
    );
    if (checkInputs) {
      const exchangeAddress = await this.getExchangeAddress(
        this.state.tokenAData.address,
        this.state.tokenBData.address
      );

      //slippage
      const slippage = 1000 - (this.state.slippage * 1000) / 100;

      const _minTokens = BigNumber.from(tokenBAmount).mul(slippage).div(1000);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      console.log(`Token pair - swapTokens..`);

      const token1 = new ethers.Contract(
        this.state.tokenAData.address,
        ERC20.abi,
        this.state.signer
      );

      const token2 = new ethers.Contract(
        this.state.tokenBData.address,
        ERC20.abi,
        this.state.signer
      );

      if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
        if (
          this.state.tokenAData.address ===
          this.isAddress(REACT_APP_WETH_ADDRESS)
        ) {
          console.log(`swapExactETHForTokensSupportingFeeOnTransferTokens..`);
          console.log(tokenAAmount.toString(), tokenBAmount.toString());
          try {
            const tx =
              await this.state.router.swapExactETHForTokensSupportingFeeOnTransferTokens(
                _minTokens,
                [this.state.tokenAData.address, this.state.tokenBData.address],
                this.state.account,
                deadline,
                {
                  value: tokenAAmount,
                  from: this.state.account,
                  ...this.overrides,
                }
              );
            await tx.wait(1);
            this.setState({ loading: false, tx: tx.hash });
            setTimeout(() => {
              this.setState({ tx: null });
            }, 3000);
          } catch (err) {
            console.log(
              `swapExactETHForTokensSupportingFeeOnTransferTokens failed ${err}`
            );
            this.setState({ loading: false });
          }
        } else if (
          this.state.tokenBData.address ===
          this.isAddress(REACT_APP_WETH_ADDRESS)
        ) {
          console.log('swapExactTokensForETHSupportingFeeOnTransferTokens..');
          console.log(tokenAAmount.toString(), tokenBAmount.toString());
          const tx0 = await token1.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              ...this.overrides,
            }
          );
          await tx0.wait(1);
          try {
            const tx =
              await this.state.router.swapExactTokensForETHSupportingFeeOnTransferTokens(
                tokenAAmount,
                _minTokens,
                [this.state.tokenAData.address, this.state.tokenBData.address],
                this.state.account,
                deadline,
                {
                  from: this.state.account,
                  ...this.overrides,
                }
              );
            tx.wait(1);

            this.setState({ loading: false, tx: tx.hash });
            setTimeout(() => {
              this.setState({ tx: null });
            }, 3000);
          } catch (err) {
            console.log(
              `swapExactTokensForETHSupportingFeeOnTransferTokens failed ${err}`
            );
            this.setState({ loading: false });
          }
        } else {
          console.log('swapExactTokensForTokensSupportingFeeOnTransferTokens');
          console.log(tokenAAmount.toString(), tokenBAmount.toString());
          const tx0 = await token1.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              ...this.overrides,
            }
          );
          await tx0.wait(1);
          const tx1 = await token2.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              ...this.overrides,
            }
          );
          await tx1.wait(1);
          try {
            const tx =
              await this.state.router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                tokenAAmount,
                _minTokens,
                [this.state.tokenAData.address, this.state.tokenBData.address],
                this.state.account,
                deadline,
                {
                  from: this.state.account,
                  ...this.overrides,
                }
              );
            tx.wait();

            this.setState({ loading: false, tx: tx.hash });
            setTimeout(() => {
              this.setState({ tx: null });
            }, 3000);
          } catch (err) {
            console.log(
              `swapExactTokensForTokensSupportingFeeOnTransferTokens failed ${err}`
            );
            this.setState({ loading: false });
          }
        }
      } else {
        console.log('No token pair');
      }
    }
  };

  getTokenAAmountSwitchedForm = async (tokenAmount: BigNumber) => {
    console.log('getTokenAAmountSwitchedForm...');
    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      const checkSelectedTokens = await this.checkIfBothTokeSelected(true);
      if (checkSelectedTokens) {
        const exchangeAddress = await this.getCalcExchangeAddress(
          this.state.tokenAData,
          this.state.tokenBData
        );
        console.log(`Exchange address - getTokenAAmount: ${exchangeAddress}`);
        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          if (BigNumber.from(tokenAmount).gt(0)) {
            const res = await this._getTokenAmountIn(
              tokenAmount,
              this.state.tokenBData.address,
              this.state.tokenAData.address
            );

            if (!res) {
              console.log('No Pair exists.. Please set the initial price');
              this.setMsg('No Pair exists.. Please set the initial price');
              return;
            }
            return res;
          } else {
            console.log('TokenAmount is undefined..');
          }
        } else {
          console.log('No Pair exists.. Please set the initial price');
          this.setMsg('No Pair exists.. Please set the initial price');
          return;
        }
      } else {
        console.log('getTokenAAmount: Select a token..');
        this.setMsg('Select a token..');
      }
    } catch (err) {
      console.log(err);
    }
  };

  getTokenBAmountSwitchedForm = async (tokenAmount: BigNumber) => {
    console.log('getTokenBAmountSwitchedForm...');
    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      const checkSelectedTokens = await this.checkIfBothTokeSelected(true);
      if (checkSelectedTokens) {
        const exchangeAddress = await this.getCalcExchangeAddress(
          this.state.tokenAData,
          this.state.tokenBData
        );
        console.log(`Exchange address - getTokenBAmount: ${exchangeAddress}`);

        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          if (BigNumber.from(tokenAmount).gt(0)) {
            const res = await this._getTokenAmountOut(
              tokenAmount,
              this.state.tokenBData.address,
              this.state.tokenAData.address
            );

            if (!res) {
              console.log('No Pair exists.. Please set the initial price');
              this.setMsg('No Pair exists.. Please set the initial price');
              return;
            }

            return res;
          } else {
            console.log('TokenAmount is undefined..');
          }
        } else {
          console.log('No Pair exists.. Please set the initial price');
          this.setMsg('No Pair exists.. Please set the initial price');
          return;
        }
      } else {
        console.log('getTokenBAmount: Select a token..');
        this.setMsg('Select a token..');
      }
    } catch (err) {
      console.log(err);
    }
  };

  getTokenAAmount = async (tokenAmount: BigNumber) => {
    console.log('getTokenAAmount...');
    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      const checkSelectedTokens = await this.checkIfBothTokeSelected(true);
      if (checkSelectedTokens) {
        const exchangeAddress = await this.getCalcExchangeAddress(
          this.state.tokenAData,
          this.state.tokenBData
        );

        console.log(`Exchange address - getTokenAAmount: ${exchangeAddress}`);
        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          if (BigNumber.from(tokenAmount).gt(0)) {
            let res = await this._getTokenAmountIn(
              tokenAmount,
              this.state.tokenAData.address,
              this.state.tokenBData.address
            );

            if (!res) {
              console.log('No Pair exists.. Please set the initial price');
              this.setMsg('No Pair exists.. Please set the initial price');
              return;
            }

            return res;
          } else {
            console.log('TokenAmount is undefined..');
          }
        } else {
          console.log('No Pair exists.. Please set the initial price');
          this.setMsg('No Pair exists.. Please set the initial price');
          return;
        }
      } else {
        console.log('getTokenAAmount: Select a token..');
        this.setMsg('Select a token..');
      }
    } catch (err) {
      console.log(err);
    }
  };

  getTokenBAmount = async (tokenAmount: BigNumber) => {
    console.log('getTokenBAmount...');
    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      const checkSelectedTokens = await this.checkIfBothTokeSelected(true);
      if (checkSelectedTokens) {
        const exchangeAddress = await this.getExchangeAddress(
          this.state.tokenAData.address,
          this.state.tokenBData.address
        );

        console.log(`Exchange address - getTokenBAmount: ${exchangeAddress}`);

        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          if (BigNumber.from(tokenAmount).gt(0)) {
            const res = await this._getTokenAmountOut(
              tokenAmount,
              this.state.tokenAData.address,
              this.state.tokenBData.address
            );

            if (!res) {
              console.log('No Pair exists.. Please set the initial price');
              this.setMsg('No Pair exists.. Please set the initial price');
              return;
            }

            return res;
          } else {
            console.log('TokenAmount is undefined..');
          }
        } else {
          console.log('No Pair exists.. Please set the initial price');
          this.setMsg('No Pair exists.. Please set the initial price');
          return;
        }
      } else {
        console.log('getTokenBAmount: Select a token..');
        this.setMsg('Select a token..');
      }
    } catch (err) {
      console.log(err);
    }
  };

  _getTokenAmountOut = async (_amount: BigNumber, token0: any, token1: any) => {
    console.log('_getTokenAmountOut..');
    try {
      const res = await this.state.router.getAmountsOut(_amount, [
        token0,
        token1,
      ]);

      return res;
    } catch (err: any) {
      console.log('---------------');
      console.log(`_getTokenAmountOut ${err}`);
      console.log('---------------');
    }
  };

  _getTokenAmountIn = async (
    _amount: BigNumber,
    token0: string,
    token1: string
  ) => {
    console.log('_getTokenAmountIn..');
    let res: any;
    try {
      res = await this.state.router.getAmountsIn(_amount, [token0, token1]);
      return res;
    } catch (err: any) {
      console.log('---------------');
      console.log(`_getTokenAmountIn ${err}`);
      console.log('---------------');
    }
  };

  toggleTokenListModal = async (tokenBSelected: boolean) => {
    this.setState({ isOpen: !this.state.isOpen, tokenBSelected });
  };

  toggleSlippageModal = async () => {
    this.setState({ isOpenModalSlippage: !this.state.isOpenModalSlippage });
  };

  setMsg = (msgTxt: string) => {
    this.setState({ msg: true, msgTxt });
    setTimeout(() => this.setState({ msg: false }), 3000);
  };

  getTokenAData = async (tokenAData: ITokenData, isModulActive: false) => {
    console.log('getTokenAData selected... ');
    if (isModulActive) {
      this.setState({ tokenAData, isOpen: !this.state.isOpen });
    } else {
      this.setState({ tokenAData });
    }
    await this.getTokenABalance(tokenAData);
    if (tokenAData?.address === this.state.tokenBData?.address) {
      this.setState({ tokenBData: null, tokenBBalance: '0' });
    }
    await this.getTokenAmountAfterSelectedAToken();
    await this.checkIfBlueberryTokenSelected(tokenAData);
    this.getLiquidityOwner(this.state.tokenAData, this.state.tokenBData);
    if (this.child.current) {
      if (tokenAData.address === this.isAddress(REACT_APP_WETH_ADDRESS)) {
        await this.getEthBalanceTokenA();
      }
    }
  };

  getTokenBData = async (tokenBData: ITokenData, isModulActive: false) => {
    console.log('getTokenBData selected... ');
    if (isModulActive) {
      this.setState({ tokenBData, isOpen: !this.state.isOpen });
    } else {
      this.setState({ tokenBData });
    }
    await this.getTokenBBalance(tokenBData);
    if (tokenBData?.address === this.state.tokenAData?.address) {
      this.setState({ tokenAData: null, tokenABalance: '0' });
    }
    await this.getTokenAmountAfterSelectedBToken();
    await this.checkIfBlueberryTokenSelected(tokenBData);
    this.getLiquidityOwner(this.state.tokenAData, this.state.tokenBData);
    if (this.child.current) {
      if (tokenBData?.address === this.isAddress(REACT_APP_WETH_ADDRESS)) {
        await this.getEthBalanceTokenB();
      }
    }
  };

  checkIfBlueberryTokenSelected = async (tokenData: ITokenData) => {
    if (tokenData.address === REACT_APP_BLUEBERRY_ADDRESS) {
      this.setMsg('Set your slippage tolerance to 12%+');
    }
  };

  getTokenAmountAfterSelectedAToken = async () => {
    console.log('getTokenAmountAfterSelectedAToken..');

    if (this.child?.current && this.state.outputAmount !== '') {
      await this.child.current.handleTokenChanges(true);
    }
  };

  getTokenAmountAfterSelectedBToken = async () => {
    console.log('getTokenAmountAfterSelectedBToken..');

    if (this.child?.current) {
      if (this.state.inputAmount !== '')
        await this.child.current.handleTokenChanges(false);
    }
  };

  getPriceImpactAToken = async (input: any) => {
    if (input && BigNumber.from(input).gt(0)) {
      let priceImp: any;

      const pairAddress = await this.getCalcExchangeAddress(
        this.state.tokenBData,
        this.state.tokenAData
      );

      const Pair = new ethers.Contract(
        pairAddress,
        Exchange.abi,
        this.state.signer
      );

      console.log(Pair);
      // token switch is considered
      const tokenData = this.state.tokenAData;
      console.log(tokenData);

      const token2 = new ethers.Contract(
        tokenData.address,
        ERC20.abi,
        this.state.signer
      );

      const token_LP_Balance = await token2.balanceOf(Pair.address);

      console.log('------------------');
      console.log(input.toString(), token_LP_Balance.toString());

      console.log('-------------------');

      priceImp =
        (parseFloat(input.toString()) * 100) / token_LP_Balance.toString();

      console.log(priceImp);

      const priceImpact = priceImp > 99.9999 ? 100 : priceImp.toFixed(4);

      this.setState({
        priceImpact,
      });
    } else {
      this.setState({
        priceImpact: 0,
      });
    }
  };

  getPriceImpactBToken = async (input: any) => {
    if (input && BigNumber.from(input).gt(0)) {
      let priceImp: any;

      const pairAddress = await this.getCalcExchangeAddress(
        this.state.tokenAData,
        this.state.tokenBData
      );

      const Pair = new ethers.Contract(
        pairAddress,
        Exchange.abi,
        this.state.signer
      );

      // token switch is considered
      const tokenData = this.state.tokenBData;

      const token2 = new ethers.Contract(
        tokenData.address,
        ERC20.abi,
        this.state.signer
      );

      const token_LP_Balance = await token2.balanceOf(Pair.address);

      priceImp =
        (parseFloat(input.toString()) * 100) / token_LP_Balance.toString();

      const priceImpact = priceImp > 99.9999 ? 100 : priceImp.toFixed(4);

      this.setState({
        priceImpact,
      });
    } else {
      this.setState({
        priceImpact: 0,
      });
    }
  };

  getLiquidityOwner = async (
    token1Data: ITokenData,
    token2Data: ITokenData
  ) => {
    try {
      const checkSelectedTokens = await this.checkIfBothTokeSelected(false);
      if (checkSelectedTokens) {
        const token1 = new ethers.Contract(
          this.state.tokenAData?.address,
          ERC20.abi,
          this.state.signer
        );

        const token2 = new ethers.Contract(
          this.state.tokenBData?.address,
          ERC20.abi,
          this.state.signer
        );

        const pairAddress = await this.getCalcExchangeAddress(
          this.state.tokenAData,
          this.state.tokenBData
        );

        const Pair = new ethers.Contract(
          pairAddress,
          Exchange.abi,
          this.state.signer
        );

        if (Pair.address !== REACT_APP_ZERO_ADDRESS) {
          const PairAddress = this.isAddress(Pair.address);
          const token_A_LP_Balance = await token1.balanceOf(PairAddress);
          const token_B_LP_Balance = await token2.balanceOf(PairAddress);
          //Pair balance account
          const liquidity = await Pair.balanceOf(this.state.account);
          const lpPairBalanceAccount = liquidity.toString();
          //Token balance
          const tokenA = token_A_LP_Balance.toString();
          //WETH balance
          const tokenB = token_B_LP_Balance.toString();
          const totalSupply = await Pair.totalSupply();
          const lpAccountShare = liquidity / totalSupply;
          const tokenAShare =
            Number.parseFloat(this.state.fromWei(tokenA)) * lpAccountShare;
          const tokenBShare =
            Number.parseFloat(this.state.fromWei(tokenB)) * lpAccountShare;
          const lpShareAccountviaInp: BigNumber = BigNumber.from(
            this.child.current.state.inputAmountInWei
          )
            .mul(100)
            .div(totalSupply);
          const lpShareAccountviaInput = lpShareAccountviaInp.toString();
          const tokenASelectedShare = token1Data?.symbol;
          const tokenBSelectedShare = token2Data?.symbol;
          // console.log(
          //   `LP Account: ${this.state.fromWei(lpPairBalanceAccount)}`
          // );
          // console.log(`LP Token Balance ${this.state.fromWei(tokenA)}`);
          // console.log(`LP WETH Balance ${this.state.fromWei(tokenB)}`);
          // console.log(`LP Total Supply: ${this.state.fromWei(totalSupply)}`);
          this.setState({
            liquidity,
            lpPairBalanceAccount,
            lpShareAccountviaInput,
            lpAccountShare,
            tokenASelectedShare,
            tokenBSelectedShare,
            tokenAShare,
            tokenBShare,
            Pair,
          });
        } else {
          this.setState({
            liquidity: 0,
            tokenASelectedShare: '',
            tokenBSelectedShare: '',
            lpPairBalanceAccount: '0',
            lpShareAccountviaInput: '0',
            lpAccountShare: 0,
            tokenAShare: 0,
            tokenBShare: 0,
            Pair,
          });
        }
      }
    } catch (e) {
      console.log(`Error getting contract ${e}`);
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    let content = (
      <Context.Provider value={this.state}>
        <Msg>
          {this.state.msg ? <MsgInner>{this.state.msgTxt}</MsgInner> : null}
        </Msg>
        {this.state.tx ? (
          <ContainerLink>
            <Link
              href={`https://testnet.bscscan.com/tx/ ${this.state.tx}`}
              target="_blank"
            >
              BSC Tx
            </Link>
          </ContainerLink>
        ) : null}
        <Tabs
          toggleSlippageModal={this.toggleSlippageModal}
          clearStates={this.clearStates}
          main={<SwapTokens switchForms={this.switchForms} ref={this.child} />}
          liquidity={<AddLiquidity ref={this.child} />}
        />
      </Context.Provider>
    );
    return (
      <>
        <Context.Provider value={this.state}>
          <Navbar account={this.state.account} />
        </Context.Provider>
        <div className="container-fluid ">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto main"
              style={{ maxWidth: '500px' }}
            >
              <div className="content justify-content-center">{content}</div>
            </main>
          </div>
        </div>
        <Context.Provider value={this.state.slippage}>
          <ModalSlippage
            setSlippage={this.setSlippage}
            isOpen={this.state.isOpenModalSlippage}
            toggleSlippageModal={this.toggleSlippageModal}
          />
        </Context.Provider>
        <Modal
          getTokenAData={this.getTokenAData}
          getTokenBData={this.getTokenBData}
          tokenBSelected={this.state.tokenBSelected}
          isOpen={this.state.isOpen}
          toggleTokenListModal={this.toggleTokenListModal}
          tokensData={this.state.tokensData}
        />
      </>
    );
  }
}
export default App;
