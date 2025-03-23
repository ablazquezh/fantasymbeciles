import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React from 'react'
import { ThemeProvider } from '@mui/material'
import theme from '../styles/theme'
import { QueryClient, QueryClientProvider } from 'react-query'
import AppBar from '../@components/primitive/AppBar'

declare let process : {
  env: {
    AUTH0_DOMAIN: string,
    AUTH0_CLIENT_ID: string
  }
}

const client = new QueryClient()
const auth0Domain = process.env.AUTH0_DOMAIN
const auth0ClientId = process.env.AUTH0_CLIENT_ID

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  let value
  if (typeof window !== 'undefined') {
    // Forces load of window info only on client-side. Otherwise, ERROR on pre-render.
    value = window.location.origin
  }

  return (
    <ThemeProvider theme={theme}>
        <QueryClientProvider client={client}>
          <AppBar />
          <Component {...pageProps} />
        </QueryClientProvider>
    </ThemeProvider>
  )
}

export default MyApp