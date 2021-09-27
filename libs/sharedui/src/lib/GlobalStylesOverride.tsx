import { GlobalStyles } from "@mui/material";

const style = {
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  html: {
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    height: '100%',
    width: '100%'
  },
  body: {
    backgroundColor: '#f4f6f8',
    height: '100%',
    width: '100%',
    fontFamily:'"FuturaNextW05-Book","Helvetica","Arial",sans-serif',
    fontSize:16
  },
  a: {
    textDecoration: 'none'
  },
  '#root': {
    height: '100%',
    width: '100%'
  }
} as const;

export const GlobalStylesOverride = <GlobalStyles styles={style}/>;
