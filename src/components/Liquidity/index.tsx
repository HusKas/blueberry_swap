import React, { Component } from 'react';
import styled from 'styled-components';
import Context from '../Context';
import { FaAngleDown } from 'react-icons/fa';
import { BigNumber } from 'ethers';

export interface ProcessEnv {
  [key: string]: string | undefined;
}

const Container = styled.div`
  margin-bottom: 20px;
  border-radius: 25px;
  border: 2px solid #73ad21;
  background: white;
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

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

interface IState {
  calc: any;
  inputAmount: any;
  inputAmountInWei: BigNumber;
  outputAmount: any;
  outputAmountInWei: BigNumber;
  loading: boolean;
}
interface IProps {
  clearStates(): any;
}

export class AddLiquidity extends Component<any, IState> {
  static contextType = Context;
  inputAmountRef = React.createRef<HTMLInputElement>();
  outputAmountRef = React.createRef<HTMLInputElement>();

  constructor(props: IProps) {
    super(props);
    this.removeLiquidity = this.removeLiquidity.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.state = {
      calc: 0,
      inputAmount: '',
      inputAmountInWei: BigNumber.from(0),
      outputAmountInWei: BigNumber.from(0),
      outputAmount: '',
      loading: false,
    };
  }

  handleSubmit = async (event: any) => {
    console.log('submit..');
    if (event.target.value !== '') {
      const inputAmountInWei: BigNumber = BigNumber.from(
        this.state.inputAmountInWei
      );
      const outputAmountInWei: BigNumber = BigNumber.from(
        this.state.outputAmountInWei
      );
      const inputAmount = this.state.inputAmount;
      if (
        inputAmountInWei &&
        outputAmountInWei &&
        inputAmount < this.context.tokenABalance
      ) {
        await this.context.addLiquidity(inputAmountInWei, outputAmountInWei);
      } else {
        alert('Not enough balance');
      }
    }
  };

  removeLiquidity = async (lpPairBalanceAccount: string) => {
    this.setState({
      loading: true,
    });

    const res = await this.context.removeLiquidity(lpPairBalanceAccount);

    if (res) {
      await this.context.getLiquidityOwner(
        this.context.tokenAData,
        this.context.tokenBData
      );
      this.setState({
        loading: false,
      });
    } else {
      console.log('Could not remove liquidity');
    }
  };

  handleOnChangeTokenAAmount = async (e: any) => {
    console.log('handleOnChangeTokenAAmount..');
    let inputAmount: any;
    let outputAmount: any;
    let inputAmountInWei: BigNumber = BigNumber.from(0);
    let outputAmountInWei: BigNumber = BigNumber.from(0);
    const input = this.outputAmountRef.current.value;

    if (input !== '' && this.isNumeric(input)) {
      outputAmount = input;
      outputAmountInWei = this.context.toWei(outputAmount).toString();
      if (BigNumber.from(outputAmountInWei).gt(0)) {
        inputAmountInWei = await this.context.getTokenAAmount(
          outputAmountInWei
        );

        if (inputAmountInWei) {
          console.log(
            inputAmountInWei[0].toString(),
            inputAmountInWei[1].toString()
          );

          inputAmount = this.context.fromWei(inputAmountInWei[0]);
          inputAmountInWei = inputAmountInWei[0].toString();

          this.inputAmountRef.current.value = inputAmount;

          this.setState({
            calc: inputAmount / outputAmount,
            inputAmount,
            inputAmountInWei,
            outputAmount,
            outputAmountInWei,
          });
          this.context.getLiquidityOwner(
            this.context.tokenAData,
            this.context.tokenBData
          );
        } else {
          this.setState({
            outputAmount,
            outputAmountInWei,
          });
        }
      }
    } else {
      this.props.clearStates();
      this.setState({
        inputAmount: '',
        outputAmount: '',
      });
    }
  };

  isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  handleOnChangeTokenBAmount = async (e: any) => {
    console.log('handleOnChangeTokenBAmount..');

    let inputAmount: any;
    let outputAmount: any;
    let inputAmountInWei: BigNumber = BigNumber.from(0);
    let outputAmountInWei: BigNumber = BigNumber.from(0);
    const input = this.inputAmountRef.current.value;
    if (input !== '' && this.isNumeric(input)) {
      inputAmount = input;
      inputAmountInWei = this.context.toWei(inputAmount).toString();

      if (BigNumber.from(inputAmountInWei).gt(0)) {
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

          this.outputAmountRef.current.value = outputAmount;

          this.setState({
            calc: inputAmount / outputAmount,
            inputAmount,
            inputAmountInWei,
            outputAmount,
            outputAmountInWei,
          });
          this.context.getLiquidityOwner(
            this.context.tokenAData,
            this.context.tokenBData
          );
        } else {
          this.setState({
            inputAmount,
            inputAmountInWei,
          });
        }
      }
    } else {
      this.props.clearStates();
      this.setState({
        inputAmount: '',
        outputAmount: '',
      });
    }
  };

  toggleModal = (tokenBSelected: boolean) => {
    this.context.toggleTokenListModal(tokenBSelected);
  };

  checkLoadingStatus = () => {
    return <p>{this.state.loading ? 'Loading..' : ''}</p>;
  };

  resetForms = () => {
    this.setState({
      inputAmount: '',
      outputAmount: '',
      inputAmountInWei: BigNumber.from(0),
      outputAmountInWei: BigNumber.from(0),
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
                {this.context.tokenABalance}
              </span>
            </div>
            <div className="input-group mb-2">
              <input
                id="tokenA"
                type="text"
                autoComplete="off"
                placeholder="0.0"
                ref={this.inputAmountRef}
                onChange={(event: any) => {
                  this.handleOnChangeTokenBAmount(event);
                }}
                className="form-control form-control-lg"
                required
              />
              <div
                className="input-group-append"
                onClick={() => this.toggleModal(false)}
              >
                {this.context.tokenAData?.symbol ? (
                  <div className="input-group-text">
                    <Image src={this.context.tokenAData?.logoURI}></Image>
                    &nbsp; {this.context.tokenAData?.symbol} <FaAngleDown />
                  </div>
                ) : (
                  <div className="input-group-text">
                    Select
                    <FaAngleDown />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="float-left">
                <b>Output</b>
              </label>
              <span className="float-right text-muted">
                Balance:
                {this.context.tokenBBalance}
              </span>
            </div>
            <div className="input-group mb-2">
              <input
                id="tokenB"
                type="text"
                autoComplete="off"
                placeholder="0.0"
                ref={this.outputAmountRef}
                onChange={(event: any) => {
                  this.handleOnChangeTokenAAmount(event);
                }}
                className="form-control form-control-lg"
                required
              />

              <div
                className="input-group-append"
                onClick={() => this.toggleModal(true)}
              >
                {this.context.tokenBData?.symbol ? (
                  <div className="input-group-text">
                    <Image src={this.context.tokenBData?.logoURI}></Image>
                    &nbsp; {this.context.tokenBData?.symbol} <FaAngleDown />
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
                    {this.context.tokenBData?.symbol} =
                    <i style={{ margin: '3px' }}>{this.state.calc}</i>
                    {this.context.tokenAData?.symbol}
                  </span>
                </>
              ) : null}
            </div>
            {this.context.correctNetwork && this.context.account ? (
              !this.context.loadingRemoveLp ? (
                !this.context.loading ? (
                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                  >
                    AddLiquidity
                  </button>
                ) : (
                  <button className="btn btn-primary btn-block btn-lg" disabled>
                    <div className="spinner-border" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </button>
                )
              ) : (
                <button className="btn btn-primary btn-block btn-lg" disabled>
                  AddLiquidity
                </button>
              )
            ) : (
              <button className="btn btn-primary btn-block btn-lg" disabled>
                Check your network
              </button>
            )}
          </form>
        </div>
      </div>

      {this.context.lpAccountShare > 0 ? (
        <Container>
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
                <Column>Owned LP</Column>
                <Column>{this.context.lpPairBalanceAccount}</Column>
              </Row>
              <Row>
                <Column> {this.context.tokenAData?.symbol}</Column>
                <Column>{this.context.tokenAShare}</Column>
              </Row>
              <Row>
                <Column> {this.context.tokenBData?.symbol}</Column>
                <Column>{this.context.tokenBShare}</Column>
              </Row>
            </ColumnContainer>
            {!this.context.loading ? (
              this.context.lpAccountShare > 0 &&
              !this.context.loadingRemoveLp ? (
                <button
                  type="submit"
                  className="btn  btn-block btn-lg removeLpButton"
                  onClick={() =>
                    this.removeLiquidity(this.context.lpPairBalanceAccount)
                  }
                >
                  RemoveLiquidity
                </button>
              ) : (
                <button
                  className="btn btn-success btn-block btn-lg removeLpButton"
                  disabled
                >
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </button>
              )
            ) : (
              <button className="btn  btn-block btn-lg removeLpButton" disabled>
                RemoveLiquidity
              </button>
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
