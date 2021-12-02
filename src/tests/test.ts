import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, constants } from 'ethers';

const toWei = (value: any) => ethers.utils.parseEther(value.toString());
import DEX from '../abi/src/contracts/BlueberryExchange.sol/BlueberryExchange.json';

const fromWei = (value: any) =>
  ethers.utils.formatEther(
    typeof value === 'string' ? value : value.toString()
  );

const getBalance = ethers.provider.getBalance;

let Exchange: any, exchange: any;
let Factory: any, factory: any;
let ExchangeLibrary: any, exchangeLibrary: any;
let Token1: any, token1: any, Token2: any, token2: any;
let WETH: any, weth: any;
let Router: any, router: any;
let owner: any, investor1: any, investor2: any;
let MINIMUM_LIQUIDITY: any;
const overrides = {
  gasLimit: 9999999,
};
/**
 * Initializing the total supply and deploing the contracts
 */
before(async () => {
  [owner, investor1, investor2] = await ethers.getSigners();
  MINIMUM_LIQUIDITY = 10 ** 3;

  Token1 = await ethers.getContractFactory('Token1');
  token1 = await Token1.deploy('Blue1', 'Blue1', '1000000000000000000000000');
  await token1.deployed();

  Token2 = await ethers.getContractFactory('Token2');
  token2 = await Token2.deploy('Blue2', 'Blue2', '1000000000000000000000000');
  await token2.deployed();

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
  console.log(`ExchangeLibrary is deployed to: ${exchangeLibrary.address}`);
  console.log(`WETH is deployed to: ${weth.address}`);
  console.log(`Factory is deployed to: ${factory.address}`);
  console.log(`Router is deployed to: ${router.address}`);
});

describe('router version', () => {
  it('should test router', async () => {
    expect(await router.factory()).to.equal(factory.address);
    expect(await router.WETH()).to.eq(weth.address);
  });
});

describe('getInitHash', () => {
  it('should return init hash', async () => {
    const initHash = await exchangeLibrary.getInitHash();
    console.log(initHash);
  });
});

describe('addLiqudity', () => {
  it('should add liquidity', async function () {
    const tx = await token1.approve(router.address, toWei(80));
    await tx.wait();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const tokenAmount = toWei(1);
    const ethAmount = toWei(4);
    // amountA * reserveB / reserveA
    const expectedLiquidity: any = toWei(2);

    await router.addLiquidityETH(
      token1.address,
      tokenAmount,
      tokenAmount,
      ethAmount,
      owner.address,
      deadline,
      {
        value: ethAmount,
        ...overrides,
      }
    );
    const WETHPairAddress = await factory.getPair(token1.address, weth.address);
    const WETHPair = new ethers.Contract(
      WETHPairAddress,
      DEX.abi,
      ethers.provider
    );
    expect(weth.address).to.equal(await WETHPair.token1());
    const tokenBalanceOfPair = await token1.balanceOf(WETHPair.address);
    const wethBalanceOfPair = await weth.balanceOf(WETHPair.address);
    const wethBalanceLpLiquidity = await WETHPair.balanceOf(owner.address);
    console.log(`TOKEN balance: ${tokenBalanceOfPair.toString()}`);
    console.log(`WETH balance: ${wethBalanceOfPair.toString()}`);
    console.log(`LP token balance: ${wethBalanceLpLiquidity}`);
    // check pair if it has the added weth
    expect(wethBalanceOfPair).to.eq(toWei(4));
    // check pair if it has the added token
    expect(tokenBalanceOfPair).to.eq(toWei(1));
    expect(await WETHPair.balanceOf(owner.address)).to.eq(
      expectedLiquidity.sub(BigNumber.from(MINIMUM_LIQUIDITY))
    );
  });

  it('should add liquidity2', async function () {
    const tx = await token1.approve(router.address, toWei(80));
    await tx.wait();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const tokenAmount = toWei(1);
    const ethAmount = toWei(4);
    // amountA * reserveB / reserveA
    const expectedLiquidity: any = toWei(2);

    await router.addLiquidityETH(
      token1.address,
      tokenAmount,
      tokenAmount,
      ethAmount,
      owner.address,
      deadline,
      {
        value: ethAmount,
        ...overrides,
      }
    );
  });

  it('should remove liquidity', async () => {
    const expectedLiquidity: any = toWei(2);
    const liquidity = expectedLiquidity.sub(BigNumber.from(MINIMUM_LIQUIDITY));
    const WETHPairAddress = await factory.getPair(token1.address, weth.address);
    const WETHPair = new ethers.Contract(
      WETHPairAddress,
      DEX.abi,
      ethers.provider
    );

    const wethBalanceLpLiquidityBefore = await WETHPair.balanceOf(
      owner.address
    );
    console.log(`LP token balance before: ${wethBalanceLpLiquidityBefore}`);

    await WETHPair.connect(owner).approve(router.address, constants.MaxUint256);
    await router.removeLiquidityETHSupportingFeeOnTransferTokens(
      token1.address,
      liquidity,
      0,
      0,
      owner.address,
      constants.MaxUint256,
      overrides
    );
    const wethBalanceLpLiquidityAfter = await WETHPair.balanceOf(owner.address);
    console.log(`LP token balance after: ${wethBalanceLpLiquidityAfter}`);
    expect(await WETHPair.balanceOf(owner.address)).to.eq(
      '2000000000000000000'
    );
  });
});

describe('getAmounts', () => {
  it('getAmountOut', async () => {
    expect(
      await router.getAmountOut(
        BigNumber.from(2),
        BigNumber.from(100),
        BigNumber.from(100)
      )
    ).to.eq(BigNumber.from(1));
    await expect(
      router.getAmountOut(
        BigNumber.from(0),
        BigNumber.from(100),
        BigNumber.from(100)
      )
    ).to.be.revertedWith('getAmountOut: INSUFFICIENT_INPUT_AMOUNT');
    await expect(
      router.getAmountOut(
        BigNumber.from(2),
        BigNumber.from(0),
        BigNumber.from(100)
      )
    ).to.be.revertedWith('getAmountOut: INSUFFICIENT_LIQUIDITY');
    await expect(
      router.getAmountOut(
        BigNumber.from(2),
        BigNumber.from(100),
        BigNumber.from(0)
      )
    ).to.be.revertedWith('getAmountOut: INSUFFICIENT_LIQUIDITY');
  });

  it('getAmountIn', async () => {
    expect(
      await router.getAmountIn(
        BigNumber.from(1),
        BigNumber.from(100),
        BigNumber.from(100)
      )
    ).to.eq(BigNumber.from(2));
    await expect(
      router.getAmountIn(
        BigNumber.from(0),
        BigNumber.from(100),
        BigNumber.from(100)
      )
    ).to.be.revertedWith('getAmountIn: INSUFFICIENT_OUTPUT_AMOUNT');
  });

  it('getAmountsOut', async () => {
    await token1.approve(router.address, constants.MaxUint256);
    await token2.approve(router.address, constants.MaxUint256);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    await router.addLiquidity(
      token1.address,
      token2.address,
      BigNumber.from(10000),
      BigNumber.from(10000),
      0,
      0,
      owner.address,
      deadline,
      overrides
    );

    await expect(
      router.getAmountsIn(BigNumber.from(1), [token1.address])
    ).to.be.revertedWith('getAmountsIn: INVALID_PATH');
    const path1 = [token1.address, token2.address];

    await expect(
      router.getAmountsOut(BigNumber.from(2), [token1.address])
    ).to.be.revertedWith('getAmountsOut: INVALID_PATH');
  });
});

async function addLiquidity(DTTAmount: BigNumber, DTT2Amount: BigNumber) {
  await token1.approve(router.address, constants.MaxUint256);
  await token2.approve(router.address, constants.MaxUint256);
  await router.addLiquidity(
    token1.address,
    token2.address,
    DTTAmount,
    DTT2Amount,
    DTTAmount,
    DTT2Amount,
    owner.address,
    constants.MaxUint256,
    overrides
  );
}

describe('swap', () => {
  // Token -> ETH
  it('swapExactTokensForETHSupportingFeeOnTransferTokens', async () => {
    const tx = await token1.approve(router.address, toWei(100));
    await tx.wait();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const tokenAmount = toWei(5).mul(100).div(99);
    const ethAmount = toWei(10);

    await token1.approve(router.address, constants.MaxUint256);
    const swapAmount = toWei(1);
    await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
      swapAmount,
      0,
      [token1.address, weth.address],
      owner.address,
      constants.MaxUint256,
      overrides
    );
    await router.addLiquidityETH(
      token1.address,
      tokenAmount,
      toWei(1),
      toWei(1),
      owner.address,
      deadline,
      {
        value: ethAmount,
        ...overrides,
      }
    );
  });

  it('swapExactTokensForETHSupportingFeeOnTransferTokens', async () => {
    const tx = await token1.approve(router.address, toWei(100));
    await tx.wait();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const tokenAmount = toWei(5).mul(100).div(99);
    const ethAmount = toWei(10);

    await token1.approve(router.address, constants.MaxUint256);
    const swapAmount = toWei(1);
    await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
      swapAmount,
      0,
      [token1.address, weth.address],
      owner.address,
      constants.MaxUint256,
      overrides
    );
    await router.addLiquidityETH(
      token1.address,
      tokenAmount,
      toWei(1),
      toWei(1),
      owner.address,
      deadline,
      {
        value: ethAmount,
        ...overrides,
      }
    );
  });

  it('should swap token to token', async () => {
    // Token to Token
    const DTTAmount = toWei(9).mul(100).div(99);
    const DTT2Amount = toWei(8);
    const amountIn = toWei(3);
    await token1.approve(router.address, constants.MaxUint256);

    beforeEach(async () => {
      await addLiquidity(DTTAmount, DTT2Amount);
    });

    await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      amountIn,
      0,
      [token1.address, token2.address],
      owner.address,
      constants.MaxUint256,
      overrides
    );
  });
});
