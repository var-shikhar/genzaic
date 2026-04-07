"use client"

import { Provider } from "react-redux"
import { store } from "./index"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import type { Session } from "next-auth"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  )
}
