import { colors } from '@mui/material';
import {responsiveFontSizes, createTheme, ThemeOptions } from '@mui/material/styles';
const themeOptions: ThemeOptions = {
  palette: {
    background:{
      default: '#F4F6F8',
      paper: colors.common.white
    },
    primary: {
      main: '#079fff',
      contrastText: 'rgba(255,255,255,0.87)',
    },
    secondary: {
      main: '#fe414d',
    },
  },
  typography: {
    fontFamily:'"FuturaNextW05-Book","Helvetica","Arial",sans-serif',
    // h1: {
    //   fontWeight: 500,
    //   fontSize: 35,
    //   letterSpacing: '-0.24px'
    // },
    // h2: {
    //   fontWeight: 500,
    //   fontSize: 29,
    //   letterSpacing: '-0.24px'
    // },
    // h3: {
    //   fontWeight: 500,
    //   fontSize: 24,
    //   letterSpacing: '-0.06px'
    // },
    // h4: {
    //   fontWeight: 500,
    //   fontSize: 20,
    //   letterSpacing: '-0.06px'
    // },
    // h5: {
    //   fontWeight: 500,
    //   fontSize: 16,
    //   letterSpacing: '-0.05px'
    // },
    // h6: {
    //   fontWeight: 500,
    //   fontSize: 14,
    //   letterSpacing: '-0.05px'
    // },
    // overline: {
    //   fontWeight: 500,
    //   fontFamily: '"FuturaNextW05-Medium","Helvetica","Arial",sans-serif',
    // },
    // subtitle1: {
    //   fontWeight: 400
    // }
  }
};

const baseTheme  = createTheme(themeOptions);

export const theme = responsiveFontSizes(baseTheme);
