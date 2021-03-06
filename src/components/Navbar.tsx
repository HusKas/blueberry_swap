import React, { Component } from 'react';
import Identicon from 'identicon.js';
import styled from 'styled-components';
import logo from '../images/logo_blueberry.png';
import Context from './Context';
import { FaWallet, FaSignOutAlt } from 'react-icons/fa';

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
          <ul className="navbar-nav px-1 d-flex flex-wrap flex-row">
            {this.context.networkName && this.context.account ? (
              <li className="nav-item">
                <WrongNetwork>{this.context.networkName}</WrongNetwork>
              </li>
            ) : (
              ''
            )}
          </ul>
          <ul className="navbar-nav px-1 d-flex flex-wrap flex-row">
            {this.props.account ? (
              <>
                <li className="nav-item text-nowrap">
                  <small className="text-light">
                    <small id="account">{this.props.account}</small>
                  </small>
                  <img
                    className="ml-1"
                    width="30"
                    height="30"
                    src={`data:image/pending;base64,${new Identicon(
                      this.props.account,
                      30
                    ).toString()}`}
                    alt=""
                  />
                </li>
              </>
            ) : (
              <li className="nav-item">
                <WrongNetwork>Connect Wallet</WrongNetwork>
              </li>
            )}
            <li className="px-3">
              <FaWallet
                size={34}
                color="white"
                cursor="pointer"
                onClick={this.context.connectToWeb3}
              ></FaWallet>
            </li>
            {this.props.account ? (
              <li className="px-3">
                <FaSignOutAlt
                  size={34}
                  color="orange"
                  cursor="pointer"
                  onClick={this.context.disConnect}
                ></FaSignOutAlt>
              </li>
            ) : (
              ''
            )}
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
