import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar';
import SwapTokens from './SwapTokens';
import Web3 from 'web3';
import Exchange from '../abi/src/contracts/BlueberryExchange.sol/BlueberryExchange.json';
import Factory from '../abi/src/contracts/BlueberryFactory.sol/BlueberryFactory.json';
import Router from '../abi/src/contracts/BlueberryRouter.sol/BlueberryRouter.json';
import WETH from '../abi/src/contracts/WETH.sol/WETH.json';
import Token from '../abi/src/contracts/Token1.sol/Token1.json';
import { BigNumber, ethers } from 'ethers';
import Context from './Context';
import { Modal } from '../components/Modalform';
import { IApp, ITokenData } from '../components/IStates/IApp';
import styled from 'styled-components';
import { Tabs } from './Tabs';
import AddLiquidity from './Liquidity';
import data from '../data.json';
import { ModalSlippage } from './ModalSlippage';

export interface ProcessEnv {
  [key: string]: string | undefined;
}

const overrides = {
  gasLimit: 6666666,
};

require('dotenv').config();

const {
  REACT_APP_ROUTER_ADDRESS,
  REACT_APP_FACTORY_ADDRESS,
  REACT_APP_ZERO_ADDRESS,
  REACT_APP_WETH_ADDRESS,
}: ProcessEnv = process.env;

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
  margin: 10px;
  padding: 10px;
  color: white;
  border: 1px solid white;
  border-radius: 25px;
`;

interface IProps {}

class App extends Component<IProps, IApp> {
  _isMounted = false;
  child: any;
  constructor(props: IProps) {
    super(props);
    this.child = React.createRef() || '';

    this.state = {
      account: '',
      web3: new Web3(Web3.givenProvider),
      weth: {},
      token1: {},
      token2: {},
      router: {},
      factory: {},
      exchange: {},
      Pair: {},
      ethBalanceTokenA: '0',
      ethBalanceTokenB: '0',
      tokenABalance: '0',
      tokenBBalance: '0',
      loading: true,
      provider: {},
      signer: {},
      exchangeAddress: '',
      swapTokens: this.swapTokens,
      addLiquidity: this.addLiquidity,
      removeLiquidity: this.removeLiquidity,
      getTokenAAmount: this.getTokenAAmount,
      getTokenBAmount: this.getTokenBAmount,
      getExchangeAddress: this.getExchangeAddress,
      getExchange: this.getExchange,
      getLiquidityOwner: this.getLiquidityOwner,
      getPriceImpact: this.getPriceImpact,
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
    };
  }
  // clear between switch tap or removing input
  clearStates = () => {
    this.setState({
      inputAmount: '',
      outputAmount: '',
      outputAmountInWei: '',
      inputAmountInWei: '',
    });
  };

  setSlippage = (slippage: string) => {
    console.log(`setSlippage...${slippage}`);
    this.setState({
      slippage,
    });
  };
  async componentDidMount() {
    this._isMounted = true;
    this.setState({
      tokensData: data,
      tokenAData: data[0],
      tokensGData: data,
    });
    await this.connectToWeb3();
    await this.loadBlockchainData();
    await this.getLiquidityOwner(this.state.tokenAData, this.state.tokenBData);
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    if (prevState.account !== this.state.account) {
      await this.getLiquidityOwner(
        this.state.tokenAData,
        this.state.tokenBData
      );
    }
  }
  switchForms = async () => {
    console.log('switchForms..');
    const tokenADataTmp = this.state.tokenAData;

    this.setState({
      tokenAData: this.state.tokenBData,
      tokenBData: tokenADataTmp,
    });

    setTimeout(async () => {
      await this.getTokenAData(this.state.tokenAData);
      await this.getTokenBData(this.state.tokenBData);
      if (this.child?.current) {
        await this.child.current.setIinputOutputVal();
      }
    });
  };

  connectToWeb3 = async () => {
    try {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        window.ethereum.on('chainChanged', (chainId: string) =>
          window.location.reload()
        );
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert(
          'Non-Ethereum browser detected. You should consider trying Metamask'
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  async loadBlockchainData() {
    const accounts = await this.state.web3.eth.getAccounts();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const network = await provider.getNetwork();

    let networkName: any, correctNetwork: any;
    [networkName, correctNetwork] = await this.getNetworkName(network.name);

    if (correctNetwork) {
      //WETH load
      const token1 = new ethers.Contract(
        REACT_APP_WETH_ADDRESS || '',
        WETH.abi,
        signer
      );

      //Router load
      const router = new ethers.Contract(
        REACT_APP_ROUTER_ADDRESS || '',
        Router.abi,
        signer
      );

      //Factory load
      const factory = new ethers.Contract(
        REACT_APP_FACTORY_ADDRESS || '',
        Factory.abi,
        signer
      );

      this.setState({
        loading: false,
        token1,
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
        this.state.tokenAData.address === REACT_APP_WETH_ADDRESS ||
        this.state.tokenBData.address === REACT_APP_WETH_ADDRESS
      )
        await this.getEthBalanceTokenA();
    });

    if (
      this.state.tokenAData.address === REACT_APP_WETH_ADDRESS ||
      this.state.tokenBData.address === REACT_APP_WETH_ADDRESS
    )
      await this.getEthBalanceTokenA();
  }

  getNetworkName = async (network: string) => {
    console.log(network);
    switch (network) {
      case 'bnb':
        return ['Binance Smart Chain', true];
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
      let ethBalance: any;
      ethBalance = await this.state.provider.getBalance(this.state.account);
      ethBalance = this.fromWei(ethBalance).toString();
      this.setState({ tokenABalance: ethBalance });
    } catch (err) {
      console.log(err);
    }
  }

  async getEthBalanceTokenB() {
    try {
      let ethBalance: any;
      ethBalance = await this.state.provider.getBalance(this.state.account);
      ethBalance = this.fromWei(ethBalance).toString();
      this.setState({ tokenBBalance: ethBalance });
    } catch (err) {
      console.log(err);
    }
  }

  async getTokenABalance(tokenData: ITokenData) {
    try {
      const token1 = new ethers.Contract(
        tokenData.address,
        Token.abi,
        this.state.signer
      );

      let tokenABalance = await token1.balanceOf(this.state.account);
      tokenABalance = this.fromWei(tokenABalance).toString();

      this.setState({ tokenABalance, token1 });
    } catch (err) {
      console.log(err);
      this.setState({ tokenABalance: '0' });
    }
  }

  async getTokenBBalance(tokenData: ITokenData) {
    try {
      const token2 = new ethers.Contract(
        tokenData.address,
        Token.abi,
        this.state.signer
      );

      let tokenBalance = await token2.balanceOf(this.state.account);
      tokenBalance = this.fromWei(tokenBalance).toString();

      this.setState({ tokenBBalance: tokenBalance, token2 });
    } catch (err) {
      console.log(err);
      this.setState({ tokenBBalance: '0' });
    }
  }
  addLiquidity = async (tokenAAmount: any, tokenBAmount: any) => {
    this.setState({ loading: true });
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    if (Object.keys(this.state.tokenBData).length > 0) {
      let exchangeAddress: any;

      exchangeAddress = await this.getExchangeAddress(
        this.state.tokenAData.address,
        this.state.tokenBData.address
      );
      console.log(`Token pair - àddLiquidity : ${exchangeAddress}`);
      if (this.state.tokenAData.address === REACT_APP_WETH_ADDRESS) {
        try {
          console.log('Adding liquditiy ETH now ...');
          //Router load
          const token2 = new ethers.Contract(
            this.state.tokenBData.address,
            Token.abi,
            this.state.signer
          );

          const tx = await token2.approve(
            this.state.router.address,
            tokenBAmount,
            {
              from: this.state.account,
              ...overrides,
            }
          );
          await tx.wait(1);

          const tx2 = await this.state.router.addLiquidityETH(
            this.state.tokenBData.address,
            tokenBAmount, //TokenB
            0,
            0,
            this.state.account,
            deadline,
            {
              from: this.state.account,
              value: tokenAAmount, //ETH
              ...overrides,
            }
          );
          await tx2.wait(1);
          this.setState({ loading: false, token2 });
        } catch (err) {
          this.setState({ loading: false });
        }
      } else if (this.state.tokenBData.address === REACT_APP_WETH_ADDRESS) {
        try {
          console.log('Adding liquditiy Token to ETH now ...');
          //Router load
          const token2 = new ethers.Contract(
            this.state.tokenAData.address,
            Token.abi,
            this.state.signer
          );

          const tx = await token2.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              ...overrides,
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
              ...overrides,
            }
          );
          await tx2.wait(1);
          this.setState({ loading: false });
        } catch (err) {
          this.setState({ loading: false });
        }
      } else {
        try {
          console.log('Adding liquditiy Token to Token now ...');
          //Router load
          const token1 = new ethers.Contract(
            this.state.tokenAData.address,
            Token.abi,
            this.state.signer
          );

          const token2 = new ethers.Contract(
            this.state.tokenBData.address,
            Token.abi,
            this.state.signer
          );

          const tx0 = await token1.approve(
            this.state.router.address,
            tokenAAmount,
            {
              from: this.state.account,
              ...overrides,
            }
          );
          await tx0.wait(1);

          const tx1 = await token2.approve(
            this.state.router.address,
            tokenBAmount,
            {
              from: this.state.account,
              ...overrides,
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
              ...overrides,
            }
          );
          await tx2.wait(1);
          this.setState({ loading: false, token1, token2 });
        } catch (err) {
          this.setState({ loading: false });
        }
      }
    } else {
      console.log('Select a token..');
      this.setMsg('Select a token..');
      this.setState({ loading: false });
    }
  };

  removeLiquidity = async (liquidityAmount: any) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
      const tx1 = await this.state.Pair.approve(
        this.state.router.address,
        liquidityAmount,
        {
          from: this.state.account,
          ...overrides,
        }
      );
      await tx1.wait(1);
      console.log(
        liquidityAmount,
        this.state.token1.address,
        this.state.token2.address
      );
      const tx2 =
        await this.state.router.removeLiquidityETHSupportingFeeOnTransferTokens(
          this.state.token2.address,
          liquidityAmount,
          0,
          0,
          this.state.account,
          deadline,
          {
            from: this.state.account,
            ...overrides,
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

  getExchangeAddress = async (token1Address: string, token2Address: string) => {
    try {
      const exchangeAddress = await this.state.factory.getPair(
        token1Address,
        token2Address
      );
      return exchangeAddress;
    } catch (err) {
      console.log(err);
    }
  };

  swapTokens = async (tokenAAmount: any, tokenBAmount: any) => {
    this.setState({ loading: true });

    const exchangeAddress = await this.getExchangeAddress(
      this.state.tokenAData.address,
      this.state.tokenBData.address
    );

    //slippage
    const slippageVal = 100 - this.state.slippage;
    const _minTokensNum = (tokenBAmount * slippageVal) / 100;
    const _minTokens = _minTokensNum.toString();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    console.log(`Token pair - swapTokens..`);

    if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
      if (this.state.tokenAData.address === REACT_APP_WETH_ADDRESS) {
        console.log(`swapExactETHForTokensSupportingFeeOnTransferTokens..`);

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
              }
            );
          tx.wait(1);

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
      } else if (this.state.tokenBData.address === REACT_APP_WETH_ADDRESS) {
        console.log('swapExactTokensForETHSupportingFeeOnTransferTokens..');
        const tx0 = await this.state.token1.approve(
          this.state.router.address,
          tokenAAmount,
          {
            from: this.state.account,
            ...overrides,
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
                ...overrides,
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

        const tx0 = await this.state.token1.approve(
          this.state.router.address,
          tokenAAmount,
          {
            from: this.state.account,
            ...overrides,
          }
        );
        await tx0.wait(1);
        const tx1 = await this.state.token2.approve(
          this.state.router.address,
          tokenAAmount,
          {
            from: this.state.account,
            ...overrides,
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
                ...overrides,
              }
            );
          tx.wait(1);

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
  };

  getTokenAAmount = async (tokenAmount: string) => {
    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      if (
        this.state.tokenBData &&
        Object.keys(this.state.tokenBData).length > 0
      ) {
        const exchangeAddress = await this.getExchangeAddress(
          this.state.tokenAData.address,
          this.state.tokenBData.address
        );
        console.log(`Exchange address - getTokenAAmount: ${exchangeAddress}`);
        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          const res = await this._getTokenAmountIn(
            tokenAmount,
            this.state.tokenAData.address,
            this.state.tokenBData.address
          );

          setTimeout(() => {
            this.setState({ msg: null });
          }, 4000);
          return res;
        } else {
          console.log(
            'No Pair exists.. You are the first provider.Please set the initial price'
          );
          this.setMsg(
            'No Pair exists..You are the first provider. Please set the initial price'
          );
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

  getTokenBAmount = async (tokenAmount: string) => {
    try {
      console.log(`Selected token: ${this.state.tokenBData.address}`);
      if (
        this.state.tokenBData &&
        Object.keys(this.state.tokenBData).length > 0
      ) {
        const exchangeAddress = await this.getExchangeAddress(
          this.state.tokenAData.address,
          this.state.tokenBData.address
        );
        console.log(`Exchange address - getTokenBAmount: ${exchangeAddress}`);
        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          const res = await this._getTokenAmountOut(
            tokenAmount,
            this.state.tokenAData.address,
            this.state.tokenBData.address
          );

          setTimeout(() => {
            this.setState({ msg: null });
          }, 3000);
          return res;
        } else {
          console.log(
            'No Pair exists.. You are the first provider.Please set the initial price'
          );
          this.setMsg(
            'No Pair exists..You are the first provider. Please set the initial price'
          );
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

  _getTokenAmountOut = async (_amount: any, token0: string, token1: string) => {
    const res = await this.state.router.getAmountsOut(_amount, [
      token0,
      token1,
    ]);
    if (res === undefined) {
      console.log(
        'No Pair exists.. You are the first provider.Please set the initial price'
      );
      this.setMsg(
        'No Pair exists..You are the first provider. Please set the initial price'
      );
      return;
    } else {
      return res;
    }
  };

  _getTokenAmountIn = async (_amount: any, token0: string, token1: string) => {
    const res = await this.state.router.getAmountsIn(_amount, [token0, token1]);
    if (res === undefined) {
      console.log(
        'No Pair exists.. You are the first provider.Please set the initial price'
      );
      this.setMsg(
        'No Pair exists..You are the first provider. Please set the initial price'
      );
      return;
    } else {
      return res;
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

  getTokenAData = async (tokenAData: ITokenData) => {
    console.log('getTokenAData selected... ');
    this.setState({ tokenAData, isOpen: !this.state.isOpen });
    await this.getTokenABalance(tokenAData);
    if (tokenAData?.address === this.state.tokenBData?.address) {
      this.setState({ tokenBData: null, tokenBBalance: '0' });
    }
    await this.getTokenAmountAfterSelectedBToken();
    this.getLiquidityOwner(this.state.tokenAData, this.state.tokenBData);
    if (this.child.current) {
      if (tokenAData.address === REACT_APP_WETH_ADDRESS) {
        await this.getEthBalanceTokenA();
      }
    }
  };

  getTokenBData = async (tokenBData: ITokenData) => {
    console.log('getTokenBData selected... ');
    this.setState({ tokenBData, isOpen: !this.state.isOpen });
    await this.getTokenBBalance(tokenBData);
    if (tokenBData?.address === this.state.tokenAData?.address) {
      this.setState({ tokenAData: null, tokenABalance: '0' });
    }
    await this.getTokenAmountAfterSelectedBToken();
    this.getLiquidityOwner(this.state.tokenAData, this.state.tokenBData);
    if (this.child.current) {
      if (tokenBData.address === REACT_APP_WETH_ADDRESS) {
        await this.getEthBalanceTokenB();
      }
    }
  };

  getTokenAmountAfterSelectedBToken = async () => {
    console.log('getTokenAmountAfterSelectedBToken..');
    let inputAmountInWei: any;
    let outputAmountInWei: any;

    if (this.child?.current) {
      inputAmountInWei = this.child.current?.state.inputAmountInWei;

      if (inputAmountInWei) {
        outputAmountInWei = await this.getTokenBAmount(inputAmountInWei);
      }

      if (outputAmountInWei) {
        const outputAmount = this.fromWei(outputAmountInWei[1]);
        outputAmountInWei = outputAmountInWei[1].toString();
        this.setState({
          outputAmount,
          outputAmountInWei,
        });
      }
    }
  };

  getPriceImpact = async (input: any) => {
    if (input) {
      const pairAddress = await this.state.factory.getPair(
        this.state.tokenAData.address,
        this.state.tokenBData.address
      );

      const Pair = new ethers.Contract(
        pairAddress,
        Exchange.abi,
        this.state.signer
      );

      const token2 = new ethers.Contract(
        this.state.tokenBData.address,
        Token.abi,
        this.state.signer
      );

      const token_B_LP_Balance = await token2.balanceOf(Pair.address);

      const priceImp = (input / parseFloat(token_B_LP_Balance)) * 100;

      const priceImpact = Number.parseFloat(priceImp.toFixed(2));

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
      if (token1Data?.address && token2Data?.address) {
        const pairAddress = await this.state.factory.getPair(
          token1Data.address,
          token2Data.address
        );

        const Pair = new ethers.Contract(
          pairAddress,
          Exchange.abi,
          this.state.signer
        );

        if (Pair.address !== REACT_APP_ZERO_ADDRESS) {
          const token_A_LP_Balance = await this.state.token1.balanceOf(
            Pair.address
          );

          const token_B_LP_Balance = await this.state.token2.balanceOf(
            Pair.address
          );

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

          const lpShareAccountviaInp =
            (this.child.current.state.inputAmountInWei * 100) / totalSupply;

          const lpShareAccountviaInput = lpShareAccountviaInp.toString();

          const tokenASelectedShare = token1Data.symbol;
          const tokenBSelectedShare = token2Data.symbol;
          // console.log(
          //   `LP Account: ${this.state.fromWei(lpPairBalanceAccount)}`
          // );
          // console.log(`LP Token Balance ${this.state.fromWei(tokenA)}`);
          // console.log(`LP WETH Balance ${this.state.fromWei(tokenB)}`);
          // console.log(`LP Total Supply: ${this.state.fromWei(totalSupply)}`);
          // console.log(`Price impact ${priceImpact}`);

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
      return;
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    let content: any;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading..
        </p>
      );
    } else {
      content = (
        <Context.Provider value={this.state}>
          {this.state.msg ? <Msg>{this.state.msgTxt}</Msg> : null}
          {this.state.tx ? (
            <ContainerLink>
              <Link
                href={`https://etherscan.io/tx/ ${this.state.tx}`}
                target="_blank"
              >
                Etherscan Tx
              </Link>
            </ContainerLink>
          ) : null}
          <Tabs
            toggleSlippageModal={this.toggleSlippageModal}
            clearStates={this.clearStates}
            main={
              <SwapTokens switchForms={this.switchForms} ref={this.child} />
            }
            liquidity={
              <AddLiquidity ref={this.child} clearStates={this.clearStates} />
            }
          />
        </Context.Provider>
      );
    }
    return (
      <>
        <Context.Provider value={this.state}>
          <Navbar account={this.state.account} />
        </Context.Provider>
        <div className="container-fluid mt-5 background-img ">
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
