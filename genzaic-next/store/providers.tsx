"use client"

import { Provider } from "react-redux"
import { store } from "./index"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>{children}</Provider>
    </SessionProvider>
  )
}
