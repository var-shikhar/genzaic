import type { Metadata } from "next"
import { Inter, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import { Providers } from "@/store/providers"
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

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${bricolage.variable} font-sans antialiased`}>
        <Providers session={session}>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
