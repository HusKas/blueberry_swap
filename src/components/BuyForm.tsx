import React, { Component } from 'react';
import styled from 'styled-components';
import Context from './Context';
import { FaAngleDown } from 'react-icons/fa';

require('dotenv').config();

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

export interface ProcessEnv {
  [key: string]: string | undefined;
}

interface IProps {
  switchForms(data: string): any;
}

interface IState {
  calc: any;
  inputAmount: any;
  inputAmountInWei: any;
  outputAmount: any;
  outputAmountInWei: any;
  loading: boolean;
}

class BuyForm extends Component<IProps, IState> {
  static contextType = Context;

  constructor(props: IProps) {
    super(props);
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
    event.preventDefault();
    if (event.target.value !== '') {
      const inputAmountInWei = this.state.inputAmountInWei;
      const outputAmountInWei = this.state.outputAmountInWei;
      if (inputAmountInWei && outputAmountInWei) {
        console.log(inputAmountInWei, outputAmountInWei);
        await this.context.buyTokens(inputAmountInWei, outputAmountInWei);
      }
    } else {
      this.context.setMsg('No pairs exists');
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
          this.context.getLiquidityOwner(this.context.tokenBData);
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
          this.context.getLiquidityOwner(this.context.tokenBData);
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

  toggleModal = (tokenBSelected: boolean) => {
    this.context.toggleTokenListModal(tokenBSelected);
  };

  clickSwitchForm = (e: any) => {
    this.props.switchForms('buy');
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
                {this.context.tokenABalance}
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
                value={this.state.inputAmount || ''}
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
                {this.context.tokenBBalance}
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
              {this.state.calc > 0 ? (
                <>
                  <span className="float-left text-muted">Exchange Rate</span>
                  <br />
                  <span className="float-right text-muted">
                    <i style={{ margin: '3px' }}>1</i>
                    {this.context.tokenBData.symbol} =
                    <i style={{ margin: '3px' }}>{this.state.calc}</i>
                    BNB
                  </span>
                </>
              ) : null}
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Swap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
  render() {
    return this.main();
  }
}
export default BuyForm;
