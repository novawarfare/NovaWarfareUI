import React from 'react';
import styled from 'styled-components';

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 51, 0, 0.8);
  padding: 10px 0;
  text-align: center;
  z-index: 999;
`;

const Text = styled.p`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  margin: 0;
`;

const HudFooter: React.FC = () => {
  return (
    <Footer>
      <Text>
        © 2025 NOVAWARFARE • TACTICAL INTERFACE v4.2.7 • COMMAND CLEARANCE: ALPHA
      </Text>
    </Footer>
  );
};

export default HudFooter; 