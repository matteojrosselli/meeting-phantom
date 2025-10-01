import { ClerkProvider } from '@clerk/nextjs'
import type { AppProps } from 'next/app'
import '../src/app/globals.css'
import { ErrorBoundary } from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ClerkProvider>
        <Component {...pageProps} />
      </ClerkProvider>
    </ErrorBoundary>
  )
}