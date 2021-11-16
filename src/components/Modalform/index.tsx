import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FixedSizeList } from 'react-window';
import data from '../../data.json';

require('dotenv').config();

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
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const SearchField = styled.input`
  width: 80%;
  border-radius: 10px;
  margin: 10px;
  padding: 5px;
  outline: none;
  border: 0.1em solid gray;
`;
const CloseIcon = styled(Flex)`
  align-items: center;
  cursor: pointer;
`;

const Container = styled.div`
  max-height: 350px;
  height: 350px;
  width: 100%;
  margin: 5px;
`;

const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  :hover {
    background-color: #effcfc;
  }
`;

const RowSymbol = styled.div``;

const NameSymbolContainer = styled(Flex)`
  flex-direction: column;
  margin: 10px;
  font-size: 0.8em;
`;

const Image = styled.img`
  width: 32px;
  height: 32px;
`;

interface IToken {
  name: string;
  address?: string;
  symbol: string;
  decimals?: number;
  chainId?: number;
  logoURI: string;
}

export const Modal = ({ isOpen, toggleTokenListModal, getTokenData }) => {
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [searchVals, setSearchVals] = useState<IToken[]>([]);

  useEffect(() => {
    setTokens(data);
    setSearchVals(data);
  }, []);
  const toggleItems = (event: any) => {
    event.preventDefault();
    toggleTokenListModal();
    setTokens(searchVals);
  };

  const handleInput = (e: any) => {
    e.preventDefault();
    let inputVal = e.target.value.toString().toLowerCase();
    if (inputVal.startsWith('0x')) {
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
        <Background>
          <ModalWrapper>
            <Container>
              <Header>
                <SearchField
                  onInput={handleInput}
                  type="text"
                  placeholder="Name or Address..0x00"
                ></SearchField>
                <CloseIcon onClick={toggleItems}>X</CloseIcon>
              </Header>
              <FixedSizeList
                height={300}
                width={300}
                itemSize={50}
                itemCount={tokens.length}
              >
                {({ index, style }) => (
                  <ContainerRow
                    className="containerTokenlist"
                    key={index}
                    style={style}
                    onClick={() => getTokenData(tokens[index])}
                  >
                    <Image src={tokens[index].logoURI} key={index + 1}></Image>
                    <NameSymbolContainer key={index + 2}>
                      <RowSymbol>{tokens[index].symbol}</RowSymbol>
                    </NameSymbolContainer>
                  </ContainerRow>
                )}
              </FixedSizeList>
            </Container>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
