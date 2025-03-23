import { createTheme } from '@mui/material/styles'

export default createTheme({
  palette: {
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
    primary: {
      main: '#BDBDBD',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    allVariants: {
      color: '#444',
    },
  },
})
