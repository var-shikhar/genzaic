import type { Metadata } from "next"
import {
  Fraunces,
  Inter_Tight,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
  DM_Serif_Display,
} from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/sonner"
import { auth } from "@/lib/auth"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
})

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
})

// Storefront type-pairing display fonts. Body across all pairings stays Inter
// Tight (the existing --font-body) — pairings differ in their display face.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-press-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-studio-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-plain-display",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: {
    default: "GenZaic - Sell Digital Products",
    template: "%s | GenZaic",
  },
  description:
    "The creator marketplace for Gen Z. Sell ebooks, templates, courses, and more.",
  keywords: [
    "digital products",
    "creator economy",
    "sell online",
    "ebooks",
    "templates",
  ],
  openGraph: {
    type: "website",
    siteName: "GenZaic",
    title: "GenZaic - Sell Digital Products",
    description: "The creator marketplace for Gen Z.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  const fontVariables = [
    fraunces.variable,
    interTight.variable,
    jetbrainsMono.variable,
    playfair.variable,
    spaceGrotesk.variable,
    dmSerif.variable,
  ].join(" ")

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
      </head>
      <body className={`${fontVariables} font-body antialiased`}>
        <Providers session={session}>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
