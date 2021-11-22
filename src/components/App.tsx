import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar';
import BuySellMain from './BuySellMain';
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

export interface ProcessEnv {
  [key: string]: string | undefined;
}

const overrides = {
  gasLimit: 9999999,
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
  border: 1px solid green;
  border-radius: 10px;
`;
const Link = styled.a`
  margin: 10px;
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
      buyTokens: this.buyTokens,
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
      tokenAExpected: BigNumber,
      tokenBExpected: BigNumber,
      lpPairBalanceAccount: '',
      priceImpact: '',
      lpShareAccountviaInput: '',
      lpAccountShare: 0,
      tokenAShare: 0,
      tokenBShare: 0,
      tokenBSelected: false,
      outputAmount: '',
      outputAmountInWei: '',
      inputAmount: '',
      inputAmountInWei: '',
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
  async componentWillMount() {
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
    // only update chart if the data has changed
    if (prevState.account !== this.state.account) {
      await this.getLiquidityOwner(
        this.state.tokenAData,
        this.state.tokenBData
      );
    }
  }
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
    if (network.name) {
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
      });
    } else {
      console.log('Wrong network');
      this.setState({
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
  addLiquidity = async (tokenAAmount: string, tokenBAmount: string) => {
    this.setState({ loading: true });
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    if (Object.keys(this.state.tokenBData).length > 0) {
      let exchangeAddress: any;

      exchangeAddress = await this.getExchangeAddress(
        this.state.tokenAData.address,
        this.state.tokenBData.address
      );
      console.log(`Token pair - àddLiquidity : ${exchangeAddress}`);

      //slippage 10%
      const amountAMin = BigNumber.from(tokenAAmount).mul(70).div(100); // for ETH
      const amountBMin = BigNumber.from(tokenBAmount).mul(70).div(100);

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
            amountBMin,
            amountAMin,
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
            amountAMin,
            amountBMin,
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
      const tx2 = await this.state.router.removeLiquidityETH(
        this.state.token2.address,
        liquidityAmount,
        this.state.tokenAExpected,
        this.state.tokenBExpected,
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
  sellTokens = async (tokenAmount: string, _minEthAmount: string) => {
    this.setState({ loading: true });

    // await this.state.token.methods
    //   .approve('REACT_APP_EXCHANGE_ADDRESS', tokenAmount)
    //   .send({ from: this.state.account });
    // await this.state.exchange.methods
    //   .tokenToEthSwap(tokenAmount, _minEthAmount)
    //   .send({ from: this.state.account })
    //   .on('transactionHash', (hash: any) => {
    //     console.log(hash);
    //   })
    //   .on('receipt', (hash: any) => {
    //     this.setState({ loading: false });
    //     this.getEthBalance();
    //     this.getTokenBalance();
    //   })
    //   .on('error', (error: any, receipt: any) => {
    //     // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //     console.log(error);
    //     if (error.code === 4001) {
    //       this.setState({ loading: false });
    //     }
    //   });
  };

  buyTokens = async (
    tokenAAmount: string,
    tokenBAmount: string,
    isETH: boolean
  ) => {
    this.setState({ loading: true });

    const exchangeAddress = await this.getExchangeAddress(
      this.state.tokenAData.address,
      this.state.tokenBData.address
    );

    //slippage
    const _minTokens = BigNumber.from(tokenBAmount).mul(90).div(100);

    console.log(`Token pair - buyTokens: ${exchangeAddress}`);
    if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
      if (this.state.tokenAData.address === REACT_APP_WETH_ADDRESS) {
        try {
          const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
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
      } else {
        try {
          const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
          const tx =
            await this.state.router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
              this.state.tokenAData.address,
              _minTokens,
              [this.state.tokenAData.address, this.state.tokenBData.address],
              this.state.account,
              deadline,
              {
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
          console.log(res[0].toString(), res[1].toString());
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

  setMsg = (msgTxt: string) => {
    this.setState({ msg: true, msgTxt });
    setTimeout(() => this.setState({ msg: false }), 3000);
  };

  getTokenAData = async (tokenAData: ITokenData) => {
    console.log('getTokenAData selected... ');
    this.setState({ tokenAData, isOpen: !this.state.isOpen });
    await this.getTokenABalance(tokenAData);
    await this.getTokenAmountAfterSelectedBToken();

    if (tokenAData.address === this.state.tokenBData.address) {
      this.setState({ tokenBData: null, tokenBBalance: '0' });
    }
    if (this.child.current) {
      this.child.current.resetForms();
      this.clearStates();
      if (tokenAData.address === REACT_APP_WETH_ADDRESS) {
        await this.getEthBalanceTokenA();
      }
    }
  };

  getTokenBData = async (tokenBData: ITokenData) => {
    console.log('getTokenBData selected... ');
    this.setState({ tokenBData, isOpen: !this.state.isOpen });
    await this.getTokenBBalance(tokenBData);
    await this.getTokenAmountAfterSelectedBToken();
    if (tokenBData.address === this.state.tokenAData.address) {
      this.setState({ tokenAData: null, tokenABalance: '0' });
    }
    if (this.child.current) {
      this.child.current.resetForms();
      this.clearStates();
      if (tokenBData.address === REACT_APP_WETH_ADDRESS) {
        await this.getEthBalanceTokenB();
      }
    }
  };

  getTokenAmountAfterSelectedBToken = async () => {
    console.log('getTokenAmountAfterSelectedBToken..');
    let inputAmountInWei: any = '';
    let outputAmountInWei: any = '';
    this.getLiquidityOwner(this.state.tokenAData, this.state.tokenBData);
    if (this.child.current?.child?.current) {
      inputAmountInWei =
        this.child.current?.child.current?.state.inputAmountInWei;
      if (inputAmountInWei) {
        outputAmountInWei = await this.getTokenBAmount(inputAmountInWei);
      }
    } else {
      inputAmountInWei = this.child.current?.state.inputAmountInWei;
      if (inputAmountInWei) {
        outputAmountInWei = await this.getTokenBAmount(inputAmountInWei);
      }
    }
    if (outputAmountInWei) {
      const outputAmount = this.fromWei(outputAmountInWei[1]);
      outputAmountInWei = outputAmountInWei[1].toString();
      this.setState({
        outputAmount,
        outputAmountInWei,
      });
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
      const token_B_LP_Balance = await this.state.weth.balanceOf(Pair.address);

      const priceImp = BigNumber.from(input)
        .mul(100)
        .div(BigNumber.from(token_B_LP_Balance));

      const priceImpact = Number.parseFloat(priceImp.toString()).toFixed(2);

      this.setState({
        priceImpact,
      });
    } else {
      this.setState({
        priceImpact: '0',
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

          const priceImp =
            (this.child.current.state.inputAmountInWei * 100) / tokenB;
          const priceImpact = priceImp.toString();

          const lpAccountShare = liquidity / totalSupply;

          const tokenAShare =
            Number.parseFloat(this.state.fromWei(tokenA)) * lpAccountShare;

          const tokenBShare =
            Number.parseFloat(this.state.fromWei(tokenB)) * lpAccountShare;

          const lpShareAccountviaInp =
            (this.child.current.state.inputAmountInWei * 100) / totalSupply;
          const lpShareAccountviaInput = lpShareAccountviaInp.toString();

          const tokenAExpected = BigNumber.from(token_A_LP_Balance)
            .mul(BigNumber.from(liquidity))
            .div(BigNumber.from(totalSupply));

          const tokenBExpected = BigNumber.from(token_B_LP_Balance)
            .mul(BigNumber.from(liquidity))
            .div(BigNumber.from(totalSupply));

          // console.log(
          //   `LP Account: ${this.state.fromWei(lpPairBalanceAccount)}`
          // );
          // console.log(`LP Token Balance ${this.state.fromWei(tokenA)}`);
          // console.log(`LP WETH Balance ${this.state.fromWei(tokenB)}`);
          // console.log(`LP Total Supply: ${this.state.fromWei(totalSupply)}`);
          // console.log(`Price impact ${priceImpact}`);

          this.setState({
            liquidity,
            tokenAExpected,
            tokenBExpected,
            lpPairBalanceAccount,
            priceImpact,
            lpShareAccountviaInput,
            lpAccountShare,
            tokenAShare,
            tokenBShare,
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
            clearStates={this.clearStates}
            main={<BuySellMain ref={this.child} />}
            liquidity={
              <AddLiquidity ref={this.child} clearStates={this.clearStates} />
            }
          />
        </Context.Provider>
      );
    }
    return (
      <>
        {<Navbar account={this.state.account} />}
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
