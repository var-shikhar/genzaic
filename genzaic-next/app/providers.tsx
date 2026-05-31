"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import type { Session } from "next-auth"
import { ReactQueryProvider } from "@/lib/react-query/provider"
import { ConfirmProvider } from "@/lib/react/confirm"
import { AuthSync } from "./auth-sync"
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ReactQueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfirmProvider>
            <AuthSync />
            <NotificationsProvider />
            {children}
          </ConfirmProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </SessionProvider>
  )
}
