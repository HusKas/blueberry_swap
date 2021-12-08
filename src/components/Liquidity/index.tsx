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

enum Token {
  tokenA = 'tokenA',
  tokenB = 'tokenB',
}

export class AddLiquidity extends Component<any, IState> {
  static contextType = Context;
  private inputAmountRef = React.createRef<any>();
  private outputAmountRef = React.createRef<HTMLInputElement>();

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
        await this.context.addLiquidity(inputAmountInWei, outputAmountInWei);
        this.setState({ loading: false });
      }
    } catch (e: any) {
      console.log(`AddLiquidity:handleSubmit ${e.error}`);
      this.setState({
        loading: false,
      });
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
      this.setState({
        loading: false,
      });
    }
  };

  isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  toggleModal = (tokenBSelected: boolean) => {
    this.context.toggleTokenListModal(tokenBSelected);
  };

  resetFormsFields = async () => {
    this.inputAmountRef.current.value = null;
    this.outputAmountRef.current.value = null;
    this.setState({
      inputAmount: null,
      outputAmount: null,
      inputAmountInWei: null,
      outputAmountInWei: null,
    });
  };

  handleTokenChanges = async (isTokenA: boolean) => {
    let inputAmount: any;
    let outputAmount: any;
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

      if (tokenID === Token.tokenA) {
        console.log('-------------------');
        console.log(tokenID);
        console.log('-------------------');
        inputAmountInWei = this.context.toWei(inputAmount);
        inputAmount = this.context.fromWei(inputAmountInWei);

        if (BigNumber.from(inputAmountInWei).gt(0)) {
          outputAmountInWei = await this.context.getTokenBAmount(
            inputAmountInWei
          );

          if (outputAmountInWei) {
            outputAmount = this.context.fromWei(outputAmountInWei[1]);
            outputAmountInWei = outputAmountInWei[1].toString();

            this.outputAmountRef.current.value = outputAmount;
            await this.context.getLiquidityOwner(this.context.tokenAData);

            this.setState({
              inputAmount,
              outputAmount,
              inputAmountInWei,
              outputAmountInWei,
            });
          }
        }
        /**
         * ###########################################
         *  tokenB
         *  ###########################################
         */
      } else if (tokenID === Token.tokenB) {
        console.log('-------------------');
        console.log(tokenID);
        console.log('-------------------');
        outputAmount = inputWithoutSpace;

        outputAmountInWei = this.context.toWei(outputAmount);
        outputAmount = this.context.fromWei(outputAmountInWei);

        if (BigNumber.from(outputAmountInWei).gt(0)) {
          inputAmountInWei = await this.context.getTokenAAmount(
            outputAmountInWei
          );

          if (inputAmountInWei) {
            inputAmount = this.context.fromWei(inputAmountInWei[0]);
            inputAmountInWei = inputAmountInWei[0].toString();
          }
          this.inputAmountRef.current.value = inputAmount;
          this.context.getLiquidityOwner(this.context.tokenBData);

          this.setState({
            inputAmount,
            outputAmount,
            inputAmountInWei,
            outputAmountInWei,
          });
        }
      }
    } else {
      await this.resetFormsFields();
    }
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
