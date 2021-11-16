import React, { Component, createRef } from 'react';
import styled from 'styled-components';
import Context from './Context';
import { FaAngleDown } from 'react-icons/fa';

interface IProps {
  buyTokens(ethAmount: string, _minTokens: string): any;
  switchForms(data: string): any;
}

interface IState {
  input: string;
  outputAmount: string;
  outputAmountInWei: string;
  calc: number;
  inputActive: boolean;
}

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

class BuyForm extends Component<IProps, IState> {
  static contextType = Context;
  private ref = createRef<HTMLInputElement>();
  constructor(props: IProps) {
    super(props);
    this.state = {
      input: '0',
      outputAmount: '0',
      outputAmountInWei: '0',
      calc: 0,
      inputActive: false,
    };
  }

  async addLiqudity() {
    let etherAmount: any, tokenAmount: any;
    etherAmount = this.state.input.toString();
    etherAmount = this.context.toWei('1');
    tokenAmount = this.context.toWei('5000');
    await this.context.addLiquidity(tokenAmount, etherAmount);
  }

  clickSwitchForm = (e: any) => {
    this.props.switchForms('buy');
  };

  render() {
    return (
      <form
        className="mb-3"
        onSubmit={(event) => {
          event.preventDefault();
          console.log('submit..');
          let etherAmount: any, minTokenAmount: any;
          // etherAmount = this.ref.current.value.toString();
          etherAmount = this.context.toWei(etherAmount).toString();
          minTokenAmount = this.state.outputAmountInWei.toString();
          if (minTokenAmount > 0) {
            this.props.buyTokens(etherAmount, minTokenAmount);
          } else {
            console.log('No pairs exists..');
            this.context.setMsg('No pairs exists');
          }
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
            type="number"
            min="0"
            step="0.000000000000000001"
            autoFocus
            onChange={async (event) => {
              console.log('chaning');
              let etherAmount: any;
              etherAmount = event.target.value;
              if (etherAmount !== '' && etherAmount > 0) {
                etherAmount = await this.context.toWei(etherAmount).toString();
                let outputAmountInWei: any;
                let outputAmount: any;

                outputAmountInWei = await this.context.getTokenAmount(
                  etherAmount
                );
                if (outputAmountInWei) {
                  outputAmount = await this.context
                    .fromWei(outputAmountInWei)
                    .toString();

                  this.setState({
                    calc: etherAmount.toString() / outputAmountInWei.toString(),
                    outputAmountInWei,
                    outputAmount,
                    input: event.target.value,
                    inputActive: true,
                  });
                }
              } else {
                this.setState({
                  outputAmount: '0',
                  calc: 0,
                  inputActive: false,
                });
              }
            }}
            ref={this.ref}
            className="form-control form-control-lg"
            placeholder="0.0"
            required
          />
          <div className="input-group-append">
            <div className="input-group-text">
              <img
                src={'0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'}
                height="32"
                alt=""
              />
              &nbsp;&nbsp;&nbsp; ETH
            </div>
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
            {this.context.tokenBalance}
          </span>
        </div>
        <div className="input-group mb-2">
          <input
            autoFocus
            type="number"
            min="0"
            className="form-control form-control-lg"
            value={this.state.outputAmount}
            disabled
          />
          <div
            className="input-group-append"
            onClick={this.context.toggleTokenListModal}
          >
            {this.context.tokenData.symbol ? (
              <div className="input-group-text">
                <Image src={this.context.tokenData.logoURI}></Image>
                &nbsp; {this.context.tokenData.symbol} <FaAngleDown />
              </div>
            ) : (
              <div className="input-group-text">
                Select <FaAngleDown />
              </div>
            )}
          </div>
        </div>
        <div className="mb-5">
          {this.state.inputActive ? (
            <>
              <span className="float-left text-muted">Exchange Rate</span>
              <br />
              <span className="float-right text-muted">
                <i style={{ margin: '3px' }}>1</i>
                Blueberry =<i style={{ margin: '3px' }}>{this.state.calc}</i>
                ETH
              </span>
            </>
          ) : null}
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg">
          SWAP
        </button>
      </form>
    );
  }
}
export default BuyForm;
