import React, { Component } from 'react';
import BuyForm from './BuyForm';
// import SellForm from './SellForm';

interface IState {
  switch: boolean;
}

class BuySellMain extends Component<any, IState> {
  constructor(props: any) {
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
      <div id="content">{<BuyForm switchForms={this.switchForms} />}</div>
    ) : (
      <div id="content">
        <div className="card mb-4">
          <div className="card-body">
            {/* <SellForm
              sellTokens={this.props.sellTokens}
              switchForms={this.switchForms}
            /> */}
          </div>
        </div>
      </div>
    );
  }
}

export default BuySellMain;
