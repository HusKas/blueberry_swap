import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { IoSettingsSharp } from 'react-icons/io5';

const UlComp = styled.ul`
  display: flex;
  border: 1px solid silver;
  border-radius: 10px;
  padding: 5px;
  width: fit-content;
`;
const LIComp = styled.li`
  padding: 10px;
  list-style: none;
  background-color: ${(props: IProps) => (props.activ ? '#e2f2f5' : 'white')};
  cursor: pointer;
  text-decoration: none;
  color: black;
`;

interface IPropsTabs {
  toggleSlippageModal(): any;
  main: {};
  liquidity: {};
  clearStates(): any;
}

interface IProps {
  activ: boolean;
}

export const Tabs = (props: IPropsTabs) => {
  const [lp, setLp] = useState(false);
  const [swap, setSwap] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    console.log(path);
    if (path === '/liquidity') {
      setLp(true);
      setSwap(false);
    } else {
      setLp(false);
      setSwap(true);
    }
  }, []);

  const setActiveLp = () => {
    setLp(true);
    setSwap(false);
    props.clearStates();
  };

  const setActiveSwap = () => {
    setLp(false);
    setSwap(true);
  };

  return (
    <Router>
      <UlComp>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <LIComp activ={swap} onClick={setActiveSwap}>
            Swap
          </LIComp>
        </Link>
        <Link to="/liquidity" style={{ textDecoration: 'none' }}>
          <LIComp activ={lp} onClick={setActiveLp}>
            Liquidity
          </LIComp>
        </Link>
        <div className="settings_slippage" onClick={props.toggleSlippageModal}>
          <IoSettingsSharp />
        </div>
      </UlComp>
      <Switch>
        <Route exact path="/">
          {props.main}
        </Route>
        <Route path="/liquidity">{props.liquidity}</Route>
      </Switch>
    </Router>
  );
};
