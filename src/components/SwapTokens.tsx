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

enum Token {
  tokenA = 'tokenA',
  tokenB = 'tokenB',
}

class SwapTokens extends Component<IProps, IState> {
  static contextType = Context;
  private inputAmountRef = React.createRef<HTMLInputElement>();
  private outputAmountRef = React.createRef<HTMLInputElement>();
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

  resetFormFields = async () => {
    this.inputAmountRef.current.value = null;
    this.outputAmountRef.current.value = null;
    this.setState({
      calcStandard: 0,
      inputAmount: null,
      outputAmount: null,
      inputAmountInWei: null,
      outputAmountInWei: null,
    });
    await this.context.clearStates();
  };

  isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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

  setInputOutputValAfterSwitch = async () => {
    let minimumReceived: any;
    let inputAmount: any, outputAmount: any;
    inputAmount = this.state.inputAmount;
    outputAmount = this.state.outputAmount;

    const tmp = this.outputAmountRef.current.value;
    this.outputAmountRef.current.value = this.inputAmountRef.current.value;
    this.inputAmountRef.current.value = tmp;

    if (this.state.switched) {
      minimumReceived =
        outputAmount - (outputAmount * this.context.slippage) / 100;
    } else {
      minimumReceived =
        inputAmount - (inputAmount * this.context.slippage) / 100;
    }

    this.setState({
      calcStandard: 0,
      minimumReceived,
      switched: !this.state.switched,
      inputAmountInWei: this.state.outputAmountInWei,
      outputAmountInWei: this.state.inputAmountInWei,
    });
  };

  handleTokenChanges = async (isTokenA: boolean) => {
    console.log('handleTokenChanges...');
    let inputAmount: any;
    let outputAmount: any;
    let minimumReceived: any;
    let calcStandard: any;
    let exchangePrice: any;
    let inputAmountInWei: BigNumber = BigNumber.from(0);
    let outputAmountInWei: BigNumber = BigNumber.from(0);

    const inputWithoutSpace = isTokenA
      ? this.inputAmountRef.current?.value.replace(/\s+/g, '')
      : this.outputAmountRef.current?.value.replace(/\s+/g, '');

    const tokenID = isTokenA
      ? this.inputAmountRef.current.id
      : this.outputAmountRef.current.id;

    if (inputWithoutSpace !== '' && this.isNumeric(inputWithoutSpace)) {
      inputAmount = inputWithoutSpace;
      /**
       * ###########################################
       * !Switched && tokenA || Switched && tokenA
       *  ###########################################
       */

      if (
        (!this.state.switched && tokenID === Token.tokenA) ||
        (this.state.switched && tokenID === Token.tokenA)
      ) {
        console.log('-------------------');
        console.log(this.state.switched, tokenID);
        console.log('-------------------');
        try {
          inputAmountInWei = this.context.toWei(inputAmount);
          inputAmount = this.context.fromWei(inputAmountInWei);

          if (BigNumber.from(inputAmountInWei).gt(0)) {
            if (!this.state.switched) {
              outputAmountInWei = await this.context.getTokenBAmount(
                inputAmountInWei
              );

              exchangePrice = await this.context.getTokenAAmount(
                this.context.toWei(1)
              );
            } else {
              outputAmountInWei =
                await this.context.getTokenAAmountSwitchedForm(
                  inputAmountInWei
                );

              exchangePrice = await this.context.getTokenBAmountSwitchedForm(
                this.context.toWei(1)
              );
            }
            if (outputAmountInWei) {
              if (!this.state.switched) {
                outputAmount = this.context.fromWei(outputAmountInWei[1]);
                outputAmountInWei = outputAmountInWei[1].toString();
                await this.context.getPriceImpactBToken(outputAmountInWei);

                if (exchangePrice) {
                  calcStandard = this.context.fromWei(
                    exchangePrice[0].toString()
                  );
                }
              } else {
                outputAmount = this.context.fromWei(outputAmountInWei[0]);
                outputAmountInWei = outputAmountInWei[0].toString();

                await this.context.getPriceImpactAToken(inputAmountInWei);

                if (exchangePrice) {
                  calcStandard = this.context.fromWei(
                    exchangePrice[1].toString()
                  );
                }
              }

              minimumReceived =
                outputAmount - (outputAmount * this.context.slippage) / 100;

              this.outputAmountRef.current.value = outputAmount;
              await this.context.getLiquidityOwner(this.context.tokenAData);

              this.setState({
                calcStandard,
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
                minimumReceived,
              });
            }
          }
        } catch (e: any) {
          console.log(`Size of entered decimal over 18 ${e}`);
        }
        /**
         * ###########################################
         *  !Switched && tokenB || Switched && tokenB
         *  ###########################################
         */
      } else if (
        (!this.state.switched && tokenID === Token.tokenB) ||
        (this.state.switched && tokenID === Token.tokenB)
      ) {
        console.log('-------------------');
        console.log(this.state.switched, tokenID);
        console.log('-------------------');
        outputAmount = inputWithoutSpace;

        try {
          outputAmountInWei = this.context.toWei(outputAmount);
          outputAmount = this.context.fromWei(outputAmountInWei);

          if (BigNumber.from(outputAmountInWei).gt(0)) {
            if (!this.state.switched) {
              inputAmountInWei = await this.context.getTokenAAmount(
                outputAmountInWei
              );
              exchangePrice = await this.context.getTokenBAmount(
                this.context.toWei(1)
              );
            } else {
              inputAmountInWei = await this.context.getTokenBAmountSwitchedForm(
                outputAmountInWei
              );
              exchangePrice = await this.context.getTokenBAmountSwitchedForm(
                this.context.toWei(1)
              );
            }
            if (inputAmountInWei) {
              if (!this.state.switched) {
                inputAmount = this.context.fromWei(inputAmountInWei[0]);
                inputAmountInWei = inputAmountInWei[0].toString();
                await this.context.getPriceImpactBToken(outputAmountInWei);
                if (exchangePrice) {
                  calcStandard = this.context.fromWei(
                    exchangePrice[1].toString()
                  );
                  this.setState({
                    calcStandard,
                  });
                }
              } else {
                inputAmount = this.context.fromWei(inputAmountInWei[1]);
                inputAmountInWei = inputAmountInWei[1].toString();
                await this.context.getPriceImpactAToken(inputAmountInWei);
                if (exchangePrice) {
                  calcStandard = this.context.fromWei(
                    exchangePrice[1].toString()
                  );
                  this.setState({
                    calcStandard,
                  });
                }
              }

              minimumReceived =
                outputAmount - (outputAmount * this.context.slippage) / 100;

              this.inputAmountRef.current.value = inputAmount;
              this.context.getLiquidityOwner(this.context.tokenBData);

              this.setState({
                inputAmount,
                outputAmount,
                inputAmountInWei,
                outputAmountInWei,
                minimumReceived,
              });
            }
          }
        } catch (e: any) {
          console.log(`Size of entered decimal over 18 ${e}`);
        }
      }
    } else {
      await this.resetFormFields();
    }
  };

  toggleModal = (tokenBSelected: boolean) => {
    this.context.toggleTokenListModal(tokenBSelected);
  };

  clickSwitchForm = async (e: any) => {
    this.props.switchForms();
    await this.setInputOutputValAfterSwitch();
  };

  main = () => (
    <div id="content">
      <div className="card mb-4">
        <div className="card-body">
          <form
            autoComplete="off"
            className="mb-3"
            onSubmit={(event: any) => {
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
              <input
                id="tokenA"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="0.0"
                ref={this.inputAmountRef}
                onChange={() => this.handleTokenChanges(true)}
                className="form-control form-control-lg"
                required
              />
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
              <input
                id="tokenB"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="0.0"
                ref={this.outputAmountRef}
                onChange={() => this.handleTokenChanges(false)}
                className="form-control form-control-lg"
                required
              />
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
                  <span className="float-right text-muted">
                    <i style={{ margin: '3px' }}>1</i>
                    {this.context.tokenBData?.symbol} =
                    <i style={{ margin: '3px' }}>{this.state?.calcStandard}</i>
                    {this.context.tokenAData?.symbol}
                  </span>
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
