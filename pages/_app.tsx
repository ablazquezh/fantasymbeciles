import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppBar from '../@components/primitive/AppBar'
import { ThemeProvider } from '@mui/material'
import theme from '../styles/theme'
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const client = new QueryClient()

const createEmotionCache = () => createCache({ key: "css", prepend: true });
const clientSideEmotionCache = createEmotionCache();


export default function App({  Component,
  pageProps,
  emotionCache = clientSideEmotionCache, // Use the Emotion cache
}: AppProps & { emotionCache?: ReturnType<typeof createEmotionCache> }) {
  return (
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
          
            <AppBar />
            <Component {...pageProps} />
          
        </ ThemeProvider>
      
      </QueryClientProvider>
    </CacheProvider>

)
}
