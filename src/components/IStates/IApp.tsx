import { BigNumber, Contract } from 'ethers';

export interface ITokenData {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
}

export interface IApp {
  account: string;
  web3: any;
  weth: any;
  token1: any;
  router: any;
  exchange: any;
  factory: any;
  Pair: any;
  ethBalance: string;
  tokenBalance: string;
  loading: boolean;
  provider: any;
  signer: any;
  exchangeAddress: string;
  addLiquidity(tokenAmount: string, ethAmount: string): void;
  removeLiquidity(liquidityAmount: string): void;
  getTokenAAmount(tokenAmount: string): any;
  getTokenBAmount(tokenAmount: string): any;
  getTokenBOutAmount(ethAmount: string): any;
  getExchangeAddress(token1: any, token2: any): any;
  getExchange(exchange: any): any;
  getLiquidityOwner(token1: ITokenData): void;
  fromWei(value: any): string;
  toWei(value: any): BigNumber;
  isOpen: boolean;
  toggleTokenListModal(): any;
  setMsg(value: string): any;
  tokensData: ITokenData[];
  tokenData: ITokenData;
  tx: any;
  msg: boolean;
  msgTxt: string;
  outputAddress: any;
  liquidity: any;
  tokenAExpected: any;
  tokenBExpected: any;
  lpPairBalanceAccount: string;
  priceImpact: string;
  lpShareAccountviaInput: string;
  lpAccountShare: number;
  tokenAShare: number;
  tokenBShare: number;
}
