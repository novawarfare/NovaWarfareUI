import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Courier New', monospace;
    background-color: #001a00;
    color: #ffffff;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  @font-face {
    font-family: 'Orbitron';
    src: url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');
  }
`;

export default GlobalStyles; 