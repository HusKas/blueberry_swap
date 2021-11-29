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
  token2: any;
  router: any;
  exchange: any;
  factory: any;
  Pair: any;
  ethBalanceTokenA: string;
  ethBalanceTokenB: string;
  tokenABalance: string;
  tokenBBalance: string;
  loading: boolean;
  provider: any;
  signer: any;
  exchangeAddress: string;
  buyTokens(tokenAmount: string, _minTokens: string, isETH: boolean): any;
  addLiquidity(tokenAmount: string, ethAmount: string): void;
  removeLiquidity(liquidityAmount: string): void;
  getTokenAAmount(tokenAmount: string): any;
  getTokenBAmount(tokenAmount: string): any;
  getExchangeAddress(token1: any, token2: any): any;
  getExchange(exchange: any): any;
  getLiquidityOwner(token1Data: ITokenData, token2Data: ITokenData): void;
  getPriceImpact(input: string): any;
  fromWei(value: any): string;
  toWei(value: any): BigNumber;
  isOpenModalSlippage: boolean;
  isOpen: boolean;
  toggleSlippageModal(): void;
  toggleTokenListModal(tokenBSelected: boolean): void;
  setMsg(value: string): any;
  tokensData: ITokenData[];
  tokensGData: ITokenData[];
  tokenAData: ITokenData;
  tokenBData: ITokenData;
  tx: any;
  msg: boolean;
  msgTxt: string;
  outputAddress: any;
  liquidity: any;
  tokenAExpected: any;
  tokenBExpected: any;
  lpPairBalanceAccount: string;
  lpShareAccountviaInput: string;
  lpAccountShare: number;
  priceImpact: number;
  tokenAShare: number;
  tokenBShare: number;
  tokenBSelected: boolean;
  outputAmount: any;
  outputAmountInWei: any;
  inputAmount: any;
  inputAmountInWei: any;
  slippage: any;
  setSlippage(slippage: string): any;
}
