import React, { Component } from 'react';
import styled from 'styled-components';
import Context from './Context';
import { FaAngleDown } from 'react-icons/fa';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { BigNumber } from 'ethers';
const Container = styled.div`
  margin-bottom: 20px;
  border-radius: 25px;
  border: 2px solid #73ad21;
  background: white;
`;

const Items = styled.div`
  margin: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;

  justify-content: center;
  margin: 10px 0 10px 0;
`;

const Column = styled.div`
  display: flex;
  flex-direction: row;
  flex-basis: 100%;
  justify-content: left;
  font-size: 15px;
`;

const ColumnRight = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  align-items: end;
  color: rgb(31, 199, 212);
  font-weight: 500;
  font-size: 16px;
`;
const ColumnTextOnly = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  color: blueviolet;
`;

const ColumnGreen = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  color: rgb(31, 199, 212);
  font-weight: 500;
  justify-content: left;
`;

const ColumnRed = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  color: red;
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

export interface ProcessEnv {
  [key: string]: string | undefined;
}

interface IProps {
  switchForms(): void;
}

interface IState {
  calcStandard: number;
  inputAmount: any;
  outputAmount: any;
  inputAmountInWei: BigNumber;
  outputAmountInWei: BigNumber;
  loading: boolean;
  minimumReceived: number;
  switched: boolean;
}

class SwapTokens extends Component<IProps, IState> {
  static contextType = Context;
  inputAmountRef = React.createRef<HTMLInputElement>();
  outputAmountRef = React.createRef<HTMLInputElement>();
  constructor(props: IProps) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);

    this.state = {
      calcStandard: 0,
      inputAmount: '',
      outputAmount: '',
      inputAmountInWei: BigNumber.from(0),
      outputAmountInWei: BigNumber.from(0),
      loading: false,
      minimumReceived: 0,
      switched: false,
    };
  }

  handleSubmit = async (event: any) => {
    console.log('submit..');
    event.preventDefault();
    this.setState({ loading: true });
    try {
      const inputAmountInWei: BigNumber = BigNumber.from(
        this.state.inputAmountInWei
      );
      const outputAmountInWei: BigNumber = BigNumber.from(
        this.state.outputAmountInWei
      );

      if (inputAmountInWei && outputAmountInWei) {
        await this.context.swapTokens(inputAmountInWei, outputAmountInWei);
        this.setState({ loading: false });
      }
    } catch (e: any) {
      console.log(`SwapTokens:handleSubmit ${e.error}`);
      this.setState({
        loading: false,
      });
    }
  };

  setInputOutputVal = async () => {
    this.inputAmountRef.current.value = this.state.outputAmount;
    this.outputAmountRef.current.value = this.state.inputAmount;

    this.setState({
      calcStandard: this.state.outputAmount / this.state.inputAmount,
      switched: !this.state.switched,
      // minimumReceived,
      inputAmountInWei: this.state.outputAmountInWei,
      outputAmountInWei: this.state.inputAmountInWei,
    });
  };

  handleOnChangeTokenAAmount = async (e: any) => {
    console.log('handleOnChangeTokenAAmount..');

    let inputAmount: any;
    let outputAmount: any;
    let minimumReceived: any;
    let inputAmountInWei: BigNumber = BigNumber.from(0);
    let outputAmountInWei: BigNumber = BigNumber.from(0);

    const input = this.outputAmountRef.current.value;
    if (input !== '' && this.isNumeric(input)) {
      outputAmount = input;
      outputAmountInWei = this.context.toWei(outputAmount);

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

          this.context.getPriceImpact(inputAmountInWei);

          if (!this.state.switched) {
            minimumReceived =
              outputAmount - (outputAmount * this.context.slippage) / 100;
          } else {
            minimumReceived =
              inputAmount - (inputAmount * this.context.slippage) / 100;
          }

          this.inputAmountRef.current.value = inputAmount;
          this.context.getLiquidityOwner(this.context.tokenBData);

          this.setState({
            calcStandard: !this.state.switched
              ? inputAmount / outputAmount
              : outputAmount / inputAmount,
            inputAmount,
            outputAmount,
            inputAmountInWei,
            outputAmountInWei,
            minimumReceived,
          });
        } else {
          this.inputAmountRef.current.value = '';
          this.setState({
            outputAmount,
            outputAmountInWei,
          });
        }
      }
    } else {
      this.inputAmountRef.current.value = '';
      this.setState({
        inputAmount: '',
        outputAmount: '',
        outputAmountInWei: BigNumber.from(0),
        calcStandard: 0,
      });
    }
  };

  handleOnChangeTokenBAmount = async (e: any) => {
    console.log('handleOnChangeTokenBAmount..');

    let inputAmount: any;
    let outputAmount: any;
    let minimumReceived: any;
    let inputAmountInWei: BigNumber = BigNumber.from(0);
    let outputAmountInWei: BigNumber = BigNumber.from(0);

    const input = this.inputAmountRef.current.value;
    if (input !== '' && this.isNumeric(input)) {
      inputAmount = input;
      inputAmountInWei = this.context.toWei(inputAmount);

      console.log(inputAmountInWei.toString());
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
          this.context.getPriceImpact(outputAmountInWei);
          if (!this.state.switched) {
            minimumReceived =
              outputAmount - (outputAmount * this.context.slippage) / 100;
          } else {
            minimumReceived =
              inputAmount - (inputAmount * this.context.slippage) / 100;
          }
          this.outputAmountRef.current.value = outputAmount;

          this.setState({
            calcStandard: !this.state.switched
              ? inputAmount / outputAmount
              : outputAmount / inputAmount,
            inputAmount,
            outputAmount,
            inputAmountInWei,
            outputAmountInWei,
            minimumReceived,
          });
        } else {
          this.outputAmountRef.current.value = '';
          this.setState({
            inputAmount,
            inputAmountInWei,
          });
        }
      }
    } else {
      this.outputAmountRef.current.value = '';
      this.context.getPriceImpact(null);
      this.context.clearStates();
      this.setState({
        inputAmount: '',
        outputAmount: '',
        inputAmountInWei: BigNumber.from(0),
        outputAmountInWei: BigNumber.from(0),
      });
    }
  };

  toggleModal = (tokenBSelected: boolean) => {
    this.context.toggleTokenListModal(tokenBSelected);
  };

  clickSwitchForm = (e: any) => {
    this.props.switchForms();
  };

  resetForms = () => {
    this.setState({
      inputAmount: null,
      outputAmount: null,
      inputAmountInWei: null,
      outputAmountInWei: null,
    });
  };

  isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

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
                {!this.state.switched ? (
                  <p>{this.context.tokenABalance}</p>
                ) : (
                  <p> {this.context.tokenBBalance}</p>
                )}
              </span>
            </div>
            <div className="input-group mb-2">
              {!this.state.switched ? (
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
              ) : (
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
              )}
              {!this.state.switched ? (
                <div
                  className="input-group-append"
                  onClick={() => this.toggleModal(false)}
                >
                  {this.context.tokenAData?.symbol ? (
                    <div className="input-group-text">
                      <Image src={this.context.tokenAData.logoURI}></Image>
                      &nbsp; {this.context.tokenAData.symbol} <FaAngleDown />
                    </div>
                  ) : (
                    <div className="input-group-text">
                      Select
                      <FaAngleDown />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="input-group-append"
                  onClick={() => this.toggleModal(false)}
                >
                  {this.context.tokenBData?.symbol ? (
                    <div className="input-group-text">
                      <Image src={this.context.tokenBData.logoURI}></Image>
                      &nbsp; {this.context.tokenBData.symbol} <FaAngleDown />
                    </div>
                  ) : (
                    <div className="input-group-text">
                      Select
                      <FaAngleDown />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="d-flex justify-content-center  m-3"
              onClick={this.clickSwitchForm}
            >
              <i className="fa fa-chevron-down"></i>
            </div>
            <div>
              <label className="float-left">
                <b>Output</b>
              </label>
              <span className="float-right text-muted">
                Balance:
                {!this.state.switched ? (
                  <p>{this.context.tokenBBalance}</p>
                ) : (
                  <p> {this.context.tokenABalance}</p>
                )}
              </span>
            </div>
            <div className="input-group mb-2">
              {!this.state.switched ? (
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
              ) : (
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
              )}
              {!this.state.switched ? (
                <div
                  className="input-group-append"
                  onClick={() => this.toggleModal(true)}
                >
                  {this.context.tokenBData?.symbol ? (
                    <div className="input-group-text">
                      <Image src={this.context.tokenBData.logoURI}></Image>
                      &nbsp; {this.context.tokenBData.symbol} <FaAngleDown />
                    </div>
                  ) : (
                    <div className="input-group-text">
                      Select
                      <FaAngleDown />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="input-group-append"
                  onClick={() => this.toggleModal(true)}
                >
                  {this.context.tokenAData?.symbol ? (
                    <div className="input-group-text">
                      <Image src={this.context.tokenAData.logoURI}></Image>
                      &nbsp; {this.context.tokenAData.symbol} <FaAngleDown />
                    </div>
                  ) : (
                    <div className="input-group-text">
                      Select
                      <FaAngleDown />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mb-5">
              <Row>
                <ColumnTextOnly>Slippage Tollerance</ColumnTextOnly>
                <ColumnRight>{this.context.slippage} %</ColumnRight>
              </Row>

              {this.state.calcStandard > 0 ? (
                <>
                  <span className="float-left text-muted">Exchange Rate</span>
                  <br />
                  {this.state.switched ? (
                    <span className="float-right text-muted">
                      <i style={{ margin: '3px' }}>1</i>
                      {this.context.tokenAData?.symbol} =
                      <i style={{ margin: '3px' }}>
                        {this.state?.calcStandard}
                      </i>
                      {this.context.tokenBData?.symbol}
                    </span>
                  ) : (
                    <span className="float-right text-muted">
                      <i style={{ margin: '3px' }}>1</i>
                      {this.context.tokenBData?.symbol} =
                      <i style={{ margin: '3px' }}>
                        {this.state?.calcStandard}
                      </i>
                      {this.context.tokenAData?.symbol}
                    </span>
                  )}
                </>
              ) : null}
            </div>
            {this.context.correctNetwork && this.context.account ? (
              !this.state.loading ? (
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                >
                  Swap
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled
                >
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
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
      {this.state.calcStandard > 0 ? (
        <Container>
          <Items>
            <ColumnContainer>
              <Row>
                <Column>
                  Minimum received <AiOutlineQuestionCircle className="icon" />
                </Column>
                <Column>
                  {this.state.outputAmountInWei
                    ? this.state.minimumReceived
                    : '0'}
                </Column>
              </Row>
            </ColumnContainer>
            <ColumnContainer>
              <Row>
                <Column>
                  Price Impact
                  <AiOutlineQuestionCircle className="icon" />
                </Column>
                {this.context.priceImpact > 3 ? (
                  <ColumnRed>{this.context.priceImpact} %</ColumnRed>
                ) : (
                  <ColumnGreen>{this.context.priceImpact} %</ColumnGreen>
                )}
              </Row>
            </ColumnContainer>
          </Items>
        </Container>
      ) : null}
    </div>
  );
  render() {
    return this.main();
  }
}
export default SwapTokens;
