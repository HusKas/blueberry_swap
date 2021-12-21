import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FixedSizeList } from 'react-window';
import ERC20 from '../../abi/src/contracts/BlueberryERC20.sol/BlueberryERC20.json';
import { ethers } from 'ethers';
import Context from './../Context';
import whicCoin from './../../images/whichCoin.png';

const Flex = styled.div`
  display: flex;
  justify-content: center;
`;

const Background = styled(Flex)`
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  position: absolute;
  align-items: center;
  top: 0;
`;

const ModalWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-width: 350px;
  width: 350px;
  height: 400px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: #fff;
  color: #000;
  z-index: 10;
  border-radius: 10px;
`;

const Header = styled.div`
  height: 70px;
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const SearchField = styled.input`
  border-radius: 10px;
  margin: 15px;
  padding: 15px;
  outline: none;
  border: 0.1em solid gray;
  font-size: 14px !important;
`;
const CloseIcon = styled(Flex)`
  position: relative;
  top: 10;
  top: 10px;
  right: 10px;
  align-items: center;
  cursor: pointer;
`;

const Container = styled.div`
  max-height: 350px;
  height: 350px;
  width: 100%;
  margin: 5px;
`;

const ContainerContent = styled.div`
  margin: 15px;
`;

const ContainerRow = styled.div`
  display: flex;
  width: 310px !important;
  height: 100%;
  flex-direction: row;
  align-items: center;
  :hover {
    background-color: #effcfc;
  }
`;

const RowSymbol = styled.div`
  width: 100%;
`;

const RowButton = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
`;

const NameSymbolContainer = styled(Flex)`
  flex-direction: column;
  margin: 10px;
  font-size: 0.8em;
`;

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

class Token {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly symbol: string,
    public readonly decimals: number,
    public readonly chainId: any,
    public readonly logoURI: string,
    public readonly custom?: boolean
  ) {}
}

interface Context {
  signer: any;
  provider: any;
  isAddress(address: any): any;
}

interface IToken {
  name: string;
  address: string;
  symbol: string;
  decimals?: number;
  chainId?: number;
  logoURI: string;
  custom?: boolean;
}

export const Modal = ({
  isOpen,
  toggleTokenListModal,
  getTokenAData,
  getTokenBData,
  tokenBSelected,
  tokensData,
}) => {
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [searchVals, setSearchVals] = useState<IToken[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState();
  const [chainId, setChainId] = useState('');
  const [logoURI, setlogoURI] = useState('');
  const context = useContext(Context) as Context;

  useEffect(() => {
    const token = window.localStorage.getItem('tokenData');
    const tokenJSON = JSON.parse(token);

    if (token && Object.keys(tokenJSON).length) {
      tokensData.push(tokenJSON);
    }

    console.log(tokensData);
    setTokens(tokensData);
    setSearchVals(tokensData);
  }, [tokensData]);

  const toggleItems = (event: any) => {
    event.preventDefault();
    toggleTokenListModal();
    setTokens(searchVals);
  };

  const importTokenData = (tokenData: IToken) => {
    const newToken = new Token(
      name,
      address,
      symbol,
      decimals,
      chainId,
      'https://cdn-icons-png.flaticon.com/512/189/189665.png',
      false
    ) as IToken;

    setTokens([newToken]);

    window.localStorage.setItem('tokenData', JSON.stringify(newToken));
  };

  const handleImageError = (event: any) => {
    console.log('handleImageError..');

    const newToken = new Token(
      name,
      address,
      symbol,
      decimals,
      chainId,
      'https://cdn-icons-png.flaticon.com/512/189/189665.png',
      true
    ) as IToken;

    setTokens([newToken]);
  };

  const getTokenLogoURL = async (address: string) =>
    `https://assets.trustwalletapp.com/blockchains/smartchain/assets/${address}/logo.png`;

  const handleInput = async (e: any) => {
    e.preventDefault();

    let inputVal = e.target.value.toString().toLowerCase();
    if (inputVal.startsWith('0x') && context.isAddress(inputVal)) {
      try {
        const tokenAddr = context.isAddress(inputVal);
        const token = new ethers.Contract(tokenAddr, ERC20.abi, context.signer);

        const name = await token.name();
        const address = tokenAddr;
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const { chainId } = await context.provider.getNetwork();

        const logoURL = await getTokenLogoURL(inputVal);

        setName(name);
        setAddress(address);
        setSymbol(symbol);
        setDecimals(decimals);
        setChainId(decimals);
        setlogoURI(logoURL);

        const newToken = new Token(
          name,
          address,
          symbol,
          decimals,
          chainId,
          logoURI,
          true
        ) as IToken;

        setTokens([newToken]);
      } catch (e: any) {
        console.log('Can not find token..');
        console.log(e);
      }
    } else {
      const res = searchVals.filter((item: any) => {
        return item.name.toLowerCase().includes(inputVal);
      });
      setTokens(res);
    }
  };

  return (
    <>
      {isOpen ? (
        <Background id="outside">
          <ModalWrapper className="ModalWrapper">
            <Container className="Container">
              <Header>
                <SearchField
                  onInput={handleInput}
                  type="text"
                  placeholder="Name or Address..0x00"
                ></SearchField>
                <CloseIcon onClick={toggleItems}>X</CloseIcon>
              </Header>
              <ContainerContent>
                <FixedSizeList
                  height={300}
                  width={350}
                  itemSize={50}
                  itemCount={tokens.length}
                  className="FixedSizeList"
                >
                  {({ index, style }) => (
                    <ContainerRow
                      className="containerTokenlist"
                      key={index}
                      style={style}
                      onClick={() =>
                        tokenBSelected
                          ? getTokenBData(tokens[index], true)
                          : getTokenAData(tokens[index], true)
                      }
                    >
                      <Image
                        onError={handleImageError}
                        src={tokens[index].logoURI}
                        key={index + 1}
                      ></Image>
                      <NameSymbolContainer key={index + 2}>
                        <RowSymbol>{tokens[index].symbol}</RowSymbol>
                      </NameSymbolContainer>
                      {tokens[index].custom ? (
                        <RowButton>
                          <button
                            className="btn btn-light"
                            type="button"
                            onClick={() => importTokenData(tokens[index])}
                          >
                            Import
                          </button>
                        </RowButton>
                      ) : (
                        ''
                      )}
                    </ContainerRow>
                  )}
                </FixedSizeList>
              </ContainerContent>
            </Container>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
