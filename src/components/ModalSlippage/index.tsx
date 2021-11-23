import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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
  height: 200px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: #fff;
  color: #000;
  z-index: 10;
  border-radius: 10px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  flex-direction: row;
  padding: 15px;
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

export const ModalSlippage = ({ isOpen, toggleSlippageModal }) => {
  const toggleItems = (event: any) => {
    event.preventDefault();
    toggleSlippageModal();
  };

  return (
    <>
      {isOpen ? (
        <Background>
          <ModalWrapper>
            <Container>
              <Header>
                <CloseIcon onClick={toggleItems}>X</CloseIcon>
              </Header>
            </Container>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
