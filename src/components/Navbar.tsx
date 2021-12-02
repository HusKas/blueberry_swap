import React, { Component } from 'react';
import Identicon from 'identicon.js';
import styled from 'styled-components';
import logo from '../images/logo_blueberry.png';
import Context from './Context';

const WrongNetwork = styled.div`
  border: 0.5px solid deeppink;
  padding: 5px;
  border-radius: 15px;
  color: white;
`;
interface IProps {
  account: any;
}

interface IState {}

class Navbar extends Component<IProps, IState> {
  static contextType = Context;
  render() {
    return (
      <nav className="navbar navbar-dark ">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img alt="logo" src={logo} height="60" />
            blueberryswap.finance
          </a>
          <ul className="navbar-nav px-3 d-flex flex-row">
            {this.context.networkName && this.context.account ? (
              <li className="nav-item px-5 ">
                <WrongNetwork>{this.context.networkName}</WrongNetwork>
              </li>
            ) : (
              ''
            )}
            {this.props.account ? (
              <>
                <li className="nav-item text-nowrap px-3 ">
                  <small className="text-light">
                    <small id="account">{this.props.account}</small>
                  </small>
                </li>
                <img
                  className="ml-2"
                  width="30"
                  height="30"
                  src={`data:image/pending;base64,${new Identicon(
                    this.props.account,
                    30
                  ).toString()}`}
                  alt=""
                />
              </>
            ) : (
              <li className="nav-item px-5 ">
                <WrongNetwork>Please Connect Metamask..</WrongNetwork>
              </li>
            )}
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
