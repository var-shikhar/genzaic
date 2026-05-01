import type { Metadata } from "next"
import {
  Inter,
  Bricolage_Grotesque,
  Roboto,
  Poppins,
  Montserrat,
  Lato,
  Open_Sans,
} from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/sonner"
import { auth } from "@/lib/auth"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  weight: ["400", "500", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
  weight: ["400", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: { default: "GenZaic - Sell Digital Products", template: "%s | GenZaic" },
  description: "The creator marketplace for Gen Z. Sell ebooks, templates, courses, and more.",
  keywords: ["digital products", "creator economy", "sell online", "ebooks", "templates"],
  openGraph: {
    type: "website",
    siteName: "GenZaic",
    title: "GenZaic - Sell Digital Products",
    description: "The creator marketplace for Gen Z.",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  const fontVariables = [
    inter.variable,
    bricolage.variable,
    roboto.variable,
    poppins.variable,
    montserrat.variable,
    lato.variable,
    openSans.variable,
  ].join(" ")

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
      </head>
      <body className={`${fontVariables} font-sans antialiased`}>
        <Providers session={session}>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
