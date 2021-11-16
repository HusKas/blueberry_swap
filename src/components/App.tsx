import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar';
import BuySellMain from './BuySellMain';
import Web3 from 'web3';
import Exchange from '../abi/src/contracts/Exchange.sol/Exchange.json';
import Factory from '../abi/src/contracts/Factory.sol/Factory.json';
import Router from '../abi/src/contracts/Router.sol/Router.json';
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
  color: red;
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
      router: {},
      factory: {},
      exchange: {},
      Pair: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      provider: {},
      signer: {},
      exchangeAddress: '',
      addLiquidity: this.addLiquidity,
      removeLiquidity: this.removeLiquidity,
      getTokenAAmount: this.getTokenAAmount,
      getTokenBAmount: this.getTokenBAmount,
      getTokenBOutAmount: this.getTokenBOutAmount,
      getExchangeAddress: this.getExchangeAddress,
      getExchange: this.getExchange,
      getLiquidityOwner: this.getLiquidityOwner,
      fromWei: this.fromWei,
      toWei: this.toWei,
      isOpen: false,
      toggleTokenListModal: this.toggleTokenListModal,
      tokensData: [] as ITokenData[],
      tokenData: {} as ITokenData,
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
    };
    this.setState({
      tokensData: data,
    });
  }

  clearStates = () => {
    this.setState({
      tokenData: null,
    });
  };
  async componentWillMount() {
    this._isMounted = true;
    await this.connectToWeb3();
    await this.loadBlockchainData();
    await this.getLiquidityOwner(this.state.tokenData);
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    // only update chart if the data has changed
    if (prevState.account !== this.state.account) {
      await this.getLiquidityOwner(this.state.tokenData);
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
      const weth = new ethers.Contract(
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
        weth,
        router,
        factory,
        account: accounts[0],
        provider,
        signer,
      });
      await this.getEthBalance();
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
      await this.getEthBalance();
      await this.getTokenBalance(this.state.tokenData);
    });
  }

  toWei(value: any) {
    return ethers.utils.parseEther(value.toString());
  }

  fromWei(value: any) {
    return ethers.utils.formatEther(
      typeof value === 'string' ? value : value.toString()
    );
  }

  async getEthBalance() {
    try {
      let ethBalance: any;
      ethBalance = await this.state.provider.getBalance(this.state.account);
      ethBalance = this.fromWei(ethBalance).toString();
      this.setState({ ethBalance });
    } catch (err) {
      console.log(err);
    }
  }
  async getTokenBalance(tokenData: ITokenData) {
    try {
      const token1 = new ethers.Contract(
        tokenData.address,
        Token.abi,
        this.state.signer
      );

      let tokenBalance: any;
      tokenBalance = await token1.balanceOf(this.state.account);
      tokenBalance = this.fromWei(tokenBalance).toString();
      this.setState({ tokenBalance, token1 });
    } catch (err) {
      console.log(err);
    }
  }
  addLiquidity = async (ethAmount: string, tokenAmount: string) => {
    this.setState({ loading: true });
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    if (Object.keys(this.state.tokenData).length > 0) {
      let exchangeAddress: any;

      exchangeAddress = await this.getExchangeAddress(
        this.state.tokenData.address,
        this.state.weth.address
      );
      console.log(`Token pair - àddLiquidity : ${exchangeAddress}`);

      try {
        console.log('Adding liquditiy now ...');
        //Router load
        const token1 = new ethers.Contract(
          this.state.tokenData.address,
          Token.abi,
          this.state.signer
        );

        this.setState({ token1 });

        const tx = await token1.approve(
          this.state.router.address,
          tokenAmount,
          {
            from: this.state.account,
            ...overrides,
          }
        );
        await tx.wait(1);

        //slippage 10%
        const minEth = BigNumber.from(ethAmount).mul(70).div(100);
        const minToken = BigNumber.from(tokenAmount).mul(70).div(100);

        const tx2 = await this.state.router.addLiquidityETH(
          this.state.tokenData.address,
          tokenAmount,
          minToken,
          minEth,
          this.state.account,
          deadline,
          {
            from: this.state.account,
            value: ethAmount,
            ...overrides,
          }
        );
        await tx2.wait(1);
        this.setState({ loading: false });
      } catch (err) {
        this.setState({ loading: false });
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

      const tx2 = await this.state.router.removeLiquidityETH(
        this.state.token1.address,
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
      // //this.setState({ loading: false });
      return true;
    } catch (e: any) {
      console.log(e);
      console.log('Could not remove liquidity');
    }
  };

  getExchange = async (exchangeAddress: string) => {
    console.log(exchangeAddress);
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

  getTokenBOutAmount = async (ethAmount: string) => {
    const tokenAmount = await this.getTokenBAmount(ethAmount);
    return tokenAmount;
  };

  getExchangeAddress = async (
    token1Address: string,
    token2Address = this.state.weth.address
  ) => {
    try {
      console.log(token1Address, token2Address);
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

  buyTokens = async (ethAmount: string, _minTokens: string) => {
    // this.setState({ loading: true });
    // const exchangeAddress = await this.getExchangeAddress(
    //   REACT_APP_TOKEN_ADDRESS || ''
    // );
    // console.log(`Token pair - buyTokens: ${exchangeAddress}`);
    // if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
    //   const exchange = await this.getExchange(exchangeAddress);
    //   try {
    //     const tx = await exchange.ethToTokenSwap(_minTokens, {
    //       value: ethAmount,
    //       from: this.state.account,
    //     });
    //     tx.wait(1);
    //     this.getEthBalance();
    //     this.getTokenBalance();
    //     this.setState({ loading: false, tx: tx.hash });
    //     setTimeout(() => {
    //       this.setState({ tx: null });
    //     }, 3000);
    //   } catch (err) {
    //     console.log(err);
    //     this.setState({ loading: false });
    //   }
    // } else {
    //   console.log('No token pair');
    // }
  };

  getTokenAAmount = async (tokenAmount: string) => {
    try {
      console.log(`Selected token: ${this.state.tokenData.address}`);
      if (Object.keys(this.state.tokenData).length > 0) {
        const exchangeAddress = await this.getExchangeAddress(
          this.state.tokenData.address
        );
        console.log(`Exchange address - getTokenBAmount: ${exchangeAddress}`);
        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          const res = await this._getTokenAmountOut(
            tokenAmount,
            this.state.tokenData.address,
            this.state.weth.address
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
        console.log('Select a token..');
        this.setMsg('Select a token..');
      }
    } catch (err) {
      console.log(err);
    }
  };

  getTokenBAmount = async (tokenAmount: string) => {
    try {
      console.log(`Selected token: ${this.state.tokenData.address}`);
      if (Object.keys(this.state.tokenData).length > 0) {
        const exchangeAddress = await this.getExchangeAddress(
          this.state.tokenData.address
        );
        console.log(`Exchange address - getTokenBAmount: ${exchangeAddress}`);
        if (exchangeAddress !== REACT_APP_ZERO_ADDRESS) {
          const res = await this._getTokenAmountOut(
            tokenAmount,
            this.state.weth.address,
            this.state.tokenData.address
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
        console.log('Select a token..');
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

  toggleTokenListModal = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  setMsg = (msgTxt: string) => {
    this.setState({ msg: true, msgTxt });
    setTimeout(() => this.setState({ msg: false }), 3000);
  };

  getTokenData = async (tokenData: ITokenData) => {
    this.setState({ tokenData, isOpen: !this.state.isOpen });
    this.getTokenBalance(tokenData);
    if (this.child.current) {
      this.child.current.resetForms();
    }
  };

  getLiquidityOwner = async (token1: ITokenData) => {
    try {
      if (token1?.address) {
        const pairAddress = await this.state.factory.getPair(
          token1.address,
          REACT_APP_WETH_ADDRESS
        );

        const Pair = new ethers.Contract(
          pairAddress,
          Exchange.abi,
          this.state.signer
        );

        if (Pair.address !== REACT_APP_ZERO_ADDRESS) {
          //WETH
          const token_B_LP_Balance = await this.state.weth.balanceOf(
            Pair.address
          );

          //Token
          const token_A_LP_Balance = await this.state.token1.balanceOf(
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

          console.log(
            `LP Account: ${this.state.fromWei(lpPairBalanceAccount)}`
          );
          console.log(`LP Token Balance ${this.state.fromWei(tokenA)}`);
          console.log(`LP WETH Balance ${this.state.fromWei(tokenB)}`);
          console.log(`LP Total Supply: ${this.state.fromWei(totalSupply)}`);
          console.log(`Price impact ${priceImpact}`);

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
          {this.state.msg ? <Msg>{this.state.msgTxt}</Msg> : null}
          <Tabs
            clearStates={this.clearStates}
            main={
              <BuySellMain
                buyTokens={this.buyTokens}
                sellTokens={this.sellTokens}
              />
            }
            liquidity={<AddLiquidity ref={this.child} />}
          />
        </Context.Provider>
      );
    }
    return (
      <>
        {<Navbar account={this.state.account} />}
        <div className="container-fluid mt-5 ">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: '600px' }}
            >
              <div className="content justify-content-center">{content}</div>
            </main>
          </div>
        </div>
        <Modal
          getTokenData={this.getTokenData}
          isOpen={this.state.isOpen}
          toggleTokenListModal={this.toggleTokenListModal}
        />
      </>
    );
  }
}
export default App;
