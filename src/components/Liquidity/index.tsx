import { Component } from 'react';
import styled from 'styled-components';
import Context from '../Context';
import { FaAngleDown } from 'react-icons/fa';
import data from '../../data.json';

export interface ProcessEnv {
  [key: string]: string | undefined;
}

require('dotenv').config();

const { REACT_APP_WETH_ADDRESS }: ProcessEnv = process.env;

const Container = styled.div`
  border: 0.5px solid skyblue;
  margin-bottom: 20px;
`;

const LiquidityItems = styled.div`
  margin: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  margin: 10px 0 10px 0;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;

  justify-content: left;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 75%;
`;

const Title = styled.h4`
  padding: 10px;
`;
interface IState {
  calc: any;
  inputAmount: any;
  inputAmountInWei: any;
  outputAmount: any;
  outputAmountInWei: any;
  loading: boolean;
}

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

export class AddLiquidity extends Component<any, IState> {
  static contextType = Context;

  constructor(props: any) {
    super(props);
    this.removeLiquidity = this.removeLiquidity.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.state = {
      calc: 0,
      inputAmount: '',
      inputAmountInWei: '',
      outputAmount: '',
      outputAmountInWei: '',
      loading: false,
    };
  }

  handleSubmit = async (event: any) => {
    console.log('submit..');
    if (event.target.value !== '') {
      const inputAmountInWei = this.state.inputAmountInWei;
      const outputAmountInWei = this.state.outputAmountInWei;
      if (inputAmountInWei && outputAmountInWei) {
        console.log(inputAmountInWei, outputAmountInWei);
        // first param is token and second eth
        await this.context.addLiquidity(inputAmountInWei, outputAmountInWei);
      }
    }
  };

  removeLiquidity = async (lpPairBalanceAccount: string) => {
    this.setState({
      loading: true,
    });

    const exchangeAddress = await this.context.getExchangeAddress(
      this.context.tokenData.address,
      REACT_APP_WETH_ADDRESS
    );

    const exchange = await this.context.getExchange(exchangeAddress);

    const res = await this.context.removeLiquidity(lpPairBalanceAccount);

    if (res) {
      await exchange.sync();
      await this.context.getLiquidityOwner(this.context.tokenData);
      this.setState({
        loading: false,
      });
    }
  };

  handleOnChangeTokenAAmount = async (e: any) => {
    console.log('changing');
    let inputAmount: any;
    let inputAmountInWei: any;
    let outputAmount: any;
    let outputAmountInWei: any;

    if (e.target.value !== '') {
      outputAmount = e.target.value;
      outputAmountInWei = this.context.toWei(outputAmount).toString();

      if (outputAmountInWei > 0 && outputAmountInWei !== '') {
        console.log(outputAmountInWei);
        inputAmountInWei = await this.context.getTokenAAmount(
          outputAmountInWei
        );

        if (inputAmountInWei) {
          console.log(
            inputAmountInWei[0].toString(),
            inputAmountInWei[1].toString()
          );

          inputAmount = this.context.fromWei(inputAmountInWei[1]);
          inputAmountInWei = inputAmountInWei[1].toString();

          this.setState({
            calc: inputAmount / outputAmount,
            inputAmount,
            inputAmountInWei,
            outputAmount,
            outputAmountInWei,
          });
          this.context.getLiquidityOwner(this.context.tokenData);
        } else {
          this.setState({
            outputAmount,
            outputAmountInWei,
          });
        }
      }
    } else {
      this.setState({
        inputAmount: '',
        outputAmount: '',
      });
    }
  };

  handleOnChangeTokenBAmount = async (e: any) => {
    console.log('changing');
    let inputAmount: any;
    let inputAmountInWei: any;
    let outputAmount: any;
    let outputAmountInWei: any;

    if (e.target.value !== '') {
      inputAmount = e.target.value;
      inputAmountInWei = this.context.toWei(inputAmount).toString();
      if (inputAmountInWei > 0 && inputAmountInWei !== '') {
        outputAmountInWei = await this.context.getTokenBAmount(
          inputAmountInWei
        );

        if (outputAmountInWei) {
          console.log(
            outputAmountInWei[0].toString(),
            outputAmountInWei[1].toString()
          );

          outputAmount = this.context.fromWei(outputAmountInWei[1]);
          outputAmountInWei = outputAmountInWei[1].toString();

          this.setState({
            calc: inputAmount / outputAmount,
            inputAmount,
            inputAmountInWei,
            outputAmount,
            outputAmountInWei,
          });
          this.context.getLiquidityOwner(this.context.tokenData);
        } else {
          this.setState({
            inputAmount,
            inputAmountInWei,
          });
        }
      }
    } else {
      this.setState({
        inputAmount: '',
        outputAmount: '',
      });
    }
  };

  toggleModal = () => {
    this.context.toggleTokenListModal();
  };

  checkLoadingStatus = () => {
    return <p>{this.state.loading ? 'Loading..' : ''}</p>;
  };

  resetForms = () => {
    this.setState({
      inputAmount: null,
      outputAmount: null,
    });
  };

  main = () => (
    <div id="content">
      <div className="card mb-4">
        <div className="card-body">
          <form
            autoComplete="off"
            className="mb-3"
            onSubmit={async (event: any) => {
              event.preventDefault();
              this.handleSubmit(event);
            }}
          >
            <div>
              <label className="float-left">
                <b>Input</b>
              </label>
              <span className="float-right text-muted">
                Balance:
                {this.context.ethBalance}
              </span>
            </div>
            <div className="input-group mb-4">
              <input
                id="tokenA"
                type="number"
                min="0"
                step="0.000000000000000001"
                autoComplete="off"
                placeholder="0.0"
                defaultValue={this.state.inputAmount || ''}
                onChange={(event: any) => {
                  this.handleOnChangeTokenBAmount(event);
                }}
                className="form-control form-control-lg"
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <Image src={data[0].logoURI}></Image>
                  &nbsp; {data[0].symbol}
                </div>
              </div>
            </div>
            <div>
              <label className="float-left">
                <b>Output</b>
              </label>
              <span className="float-right text-muted">
                Balance:
                {this.context.tokenBalance}
              </span>
            </div>
            <div className="input-group mb-2">
              <input
                id="tokenB"
                type="number"
                min="0"
                step="0.000000000000000001"
                autoComplete="off"
                placeholder="0.0"
                value={this.state.outputAmount || ''}
                className="form-control form-control-lg"
                onChange={(event: any) => {
                  this.handleOnChangeTokenAAmount(event);
                }}
                required
              />

              <div className="input-group-append" onClick={this.toggleModal}>
                {this.context.tokenData?.symbol ? (
                  <div className="input-group-text">
                    <Image src={this.context.tokenData.logoURI}></Image>
                    &nbsp; {this.context.tokenData.symbol} <FaAngleDown />
                  </div>
                ) : (
                  <div className="input-group-text">
                    Select
                    <FaAngleDown />
                  </div>
                )}
              </div>
            </div>
            <div className="mb-5">
              {this.state.calc > 0 ? (
                <>
                  <span className="float-left text-muted">Exchange Rate</span>
                  <br />
                  <span className="float-right text-muted">
                    <i style={{ margin: '3px' }}>1</i>
                    {this.context.tokenData.symbol} =
                    <i style={{ margin: '3px' }}>{this.state.calc}</i>
                    BNB
                  </span>
                </>
              ) : null}
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              AddLiquidity
            </button>
          </form>
        </div>
      </div>

      {this.state.calc > 0 ? (
        <Container>
          <Title>Provided Liquidity</Title>
          <LiquidityItems>
            <ColumnContainer>
              <Row>
                <Column>Pool Share:</Column>
                <Column>
                  {(
                    Number.parseFloat(this.context.lpAccountShare) * 100
                  ).toFixed(2)}
                  %
                </Column>
              </Row>
              <Row>
                <Column>Owned LP tokens</Column>
                <Column>{this.context.lpPairBalanceAccount}</Column>
              </Row>
              <Row>
                <Column> {this.context.tokenData.symbol}</Column>
                <Column>{this.context.tokenAShare}</Column>
              </Row>
              <Row>
                <Column> BNB</Column>
                <Column>{this.context.tokenBShare}</Column>
              </Row>
            </ColumnContainer>
            {this.context.lpAccountShare > 0 ? (
              <button
                onClick={() =>
                  this.removeLiquidity(this.context.lpPairBalanceAccount)
                }
                className="btn btn-success btn-block btn-lg"
              >
                <Row>
                  {this.state.loading ? <Column> Loading..</Column> : ''}
                  <Column>RemoveLiquidity</Column>
                </Row>
              </button>
            ) : (
              ''
            )}
          </LiquidityItems>
        </Container>
      ) : null}
    </div>
  );

  render() {
    return this.main();
  }
}
export default AddLiquidity;
