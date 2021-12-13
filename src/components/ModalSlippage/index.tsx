import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import Context from '../Context';

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
  overflow: hidden;
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
`;

const CloseIcon = styled(Flex)`
  align-items: center;
  cursor: pointer;
`;

const Container = styled.div`
  max-height: 350px;
  width: 100%;
  margin: 5px;
`;

const ContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  height: 100px;
  justify-content: center;
  align-items: center;
`;

interface IProps {
  active: boolean;
}

const Button = styled.button`
  background-color: ${(props: IProps) =>
    props.active ? 'rgb(31, 199, 212);' : 'palevioletred'};
  box-shadow: rgb(14 14 44 / 40%) 0px -1px 0px 0px inset;
  color: white;
  cursor: pointer;
  font-weight: 600;
  width: 60px;
  height: 30px;
  margin: 5px;
  border: 0;
  border-radius: 25px;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
`;

const ButtonText = styled.button`
  box-shadow: rgb(14 14 44 / 40%) 0px -1px 0px 0px inset;
  color: white;
  cursor: pointer;
  font-weight: 600;
  width: 60px;
  height: 30px;
  margin: 5px;
  padding: 0;
  border: 0;
  border-radius: 25px;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
`;

const Input = styled.input`
  width: 100%;
  border: 0;
  border-radius: 25px;
  justify-content: center;
  height: 25px !important;
  padding: 15px;
`;

export const ModalSlippage = ({ isOpen, toggleSlippageModal, setSlippage }) => {
  const toggleItems = (event: any) => {
    event.preventDefault();
    toggleSlippageModal();
  };
  const slippage = useContext(Context);

  const [firstButton, setFirstButton] = useState(true);
  const [secondButton, setSecondButton] = useState(false);
  const [thirdButton, setThirdButton] = useState(false);

  const enum ButtonList {
    FirstButton,
    SecondButton,
    ThirdButton,
  }

  const setSlippageVal = (buttonIndex: number) => {
    console.log(buttonIndex === ButtonList.FirstButton);
    if (buttonIndex === ButtonList.FirstButton) {
      setSlippage('0.1');
      setFirstButton(true);
      setSecondButton(false);
      setThirdButton(false);
    }
    if (buttonIndex === ButtonList.SecondButton) {
      setSlippage('0.2');
      setFirstButton(false);
      setSecondButton(true);
      setThirdButton(false);
    }
    if (buttonIndex === ButtonList.ThirdButton) {
      setSlippage('1');
      setFirstButton(false);
      setSecondButton(false);
      setThirdButton(true);
    }
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
              <ContainerRow>
                <Button active={firstButton} onClick={() => setSlippageVal(0)}>
                  0.1%
                </Button>
                <Button active={secondButton} onClick={() => setSlippageVal(1)}>
                  0.2%
                </Button>
                <Button active={thirdButton} onClick={() => setSlippageVal(2)}>
                  1%
                </Button>
                <ButtonText>
                  <Input
                    value={slippage.toString()}
                    onChange={(ev: any) => setSlippage(ev.target.value)}
                  ></Input>
                </ButtonText>
                %
              </ContainerRow>
              <button
                onClick={toggleItems}
                className="btn btn-info btn-block confirm"
              >
                Confirm
              </button>
            </Container>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
