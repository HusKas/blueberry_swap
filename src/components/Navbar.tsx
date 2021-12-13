import React, { Component } from 'react';
import Identicon from 'identicon.js';
import styled from 'styled-components';
import logo from '../images/logo_blueberry.png';
import Context from './Context';
import { FaWallet } from 'react-icons/fa';

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
                <li className="nav-item text-nowrap mt-2 ">
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
                <WrongNetwork>Please Connect Metamask..</WrongNetwork>
              </li>
            )}
            <li className="mt-1 px-3">
              <FaWallet
                size={34}
                color="white"
                cursor="pointer"
                onClick={this.context.connectToWeb3}
              ></FaWallet>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
