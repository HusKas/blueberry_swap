import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FixedSizeList } from 'react-window';

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
  outline: none;
  border: 0.1em solid gray;
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

  useEffect(() => {
    setTokens(tokensData);
    setSearchVals(tokensData);
  }, [tokensData]);

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
                        src={tokens[index].logoURI}
                        key={index + 1}
                      ></Image>
                      <NameSymbolContainer key={index + 2}>
                        <RowSymbol>{tokens[index].symbol}</RowSymbol>
                      </NameSymbolContainer>
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
