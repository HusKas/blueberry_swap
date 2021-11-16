import React, { Component, createRef } from 'react';
import Context from './Context';
declare let window: any;

interface IProps {
  sellTokens(tokenAmount: string, _minEthAmount: string): any;
  switchForms(data: string): any;
}

interface IState {
  input: string;
  outputAmount: string;
  calc: number;
}

class SellForm extends Component<IProps, IState> {
  static contextType = Context;
  private ref: any = createRef<HTMLInputElement>();
  constructor(props: IProps) {
    super(props);
    this.state = {
      input: '0',
      outputAmount: '0',
      calc: 0,
    };
  }

  async addLiqudity() {
    let etherAmount: any, tokenAmount: any;
    etherAmount = this.state.input.toString();
    etherAmount = this.context.toWei('1');
    tokenAmount = this.context.toWei('5000');
    await this.context.addLiquidity(tokenAmount, etherAmount);
  }

  clickSwitchForm = () => {
    this.props.switchForms('sell');
  };

  render() {
    return (
      <form
        className="mb-3"
        onSubmit={(event) => {
          event.preventDefault();
          console.log('submit..');
          let tokenAmount: any, minEthAmount: any;
          tokenAmount = this.ref.current.value.toString();
          tokenAmount = window.web3.utils.toWei(tokenAmount, 'ether');
          minEthAmount = this.state.outputAmount;
          this.props.sellTokens(tokenAmount, minEthAmount);
        }}
      >
        <div>
          <label className="float-left">
            <b>Input</b>
          </label>
          <span className="float-right text-muted">
            Balance:
            {this.context.tokenBalance}
          </span>
        </div>
        <div className="input-group mb-4">
          <input
            type="number"
            min="0"
            onChange={async (event) => {
              console.log('chaning');
              this.setState({ input: this.ref.current.value.toString() });
              let tokenAmount: any;
              tokenAmount = event.target.value;
              if (tokenAmount !== '' && tokenAmount >= 1) {
                tokenAmount = window.web3.utils.toWei(tokenAmount, 'ether');
                let outputAmountInWei: any;
                let outputAmount: any;

                outputAmountInWei = await this.context.getEthAmount(
                  tokenAmount
                );

                outputAmount = this.context
                  .fromWei(outputAmountInWei)
                  .toString();

                this.setState({
                  calc: tokenAmount.toString() / outputAmountInWei.toString(),
                });
                this.setState({ outputAmount });
              } else {
                this.setState({
                  outputAmount: '0',
                  calc: 0,
                });
              }
            }}
            ref={this.ref}
            className="form-control form-control-lg"
            placeholder="0"
            required
          />
          <div className="input-group-append">
            <div className="input-group-text">
              <img
                src={
                  'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
                }
                height="32"
                alt=""
              />
              &nbsp;&nbsp;&nbsp; Melone
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
            {this.context.ethBalance}
          </span>
        </div>
        <div className="input-group mb-2">
          <input
            type="number"
            min="0"
            className="form-control form-control-lg"
            placeholder="0"
            value={this.state.outputAmount}
            disabled
          />
          <div className="input-group-append">
            <div className="input-group-text">
              <img
                src={
                  'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
                }
                height="32"
                alt=""
              />
              &nbsp; ETH
            </div>
          </div>
        </div>
        <div className="mb-5">
          <span className="float-left text-muted">Exchange Rate</span>
          <span className="float-right text-muted">
            1 Melone ={this.state.calc} ETH
          </span>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg">
          SWAP
        </button>
        <button
          onClick={this.addLiqudity.bind(this)}
          type="submit"
          className="btn btn-primary btn-block btn-lg"
        >
          AddLiquidity
        </button>
      </form>
    );
  }
}

export default SellForm;
