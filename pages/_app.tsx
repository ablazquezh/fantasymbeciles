import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppBar from '../@components/primitive/AppBar'
import { ThemeProvider } from '@mui/material'
import theme from '../styles/theme'

const client = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>

      <QueryClientProvider client={client}>
        <AppBar />
        <Component {...pageProps} />
      </QueryClientProvider>

    </ ThemeProvider>

)
}
