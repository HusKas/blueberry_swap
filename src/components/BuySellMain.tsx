import React, { Component } from 'react';
import BuyForm from './BuyForm';
import SellForm from './SellForm';

interface IProps {
  buyTokens(ethAmount: string, _minTokens: string): any;
  sellTokens(tokenAmount: string, _minEthAmount: string): any;
}

interface IState {
  switch: boolean;
}

class BuySellMain extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      switch: true,
    };
  }

  switchForms = async () => {
    this.setState({ switch: !this.state.switch });
  };

  render() {
    return this.state.switch ? (
      <div id="content">
        <div className="card mb-4">
          <div className="card-body">
            <BuyForm
              buyTokens={this.props.buyTokens}
              switchForms={this.switchForms}
            />
          </div>
        </div>
      </div>
    ) : (
      <div id="content">
        <div className="card mb-4">
          <div className="card-body">
            <SellForm
              sellTokens={this.props.sellTokens}
              switchForms={this.switchForms}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default BuySellMain;
