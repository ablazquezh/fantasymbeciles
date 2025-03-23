import { createTheme } from '@mui/material/styles'

export default createTheme({
  palette: {
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
    primary: {
      main: '#30b013',
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
