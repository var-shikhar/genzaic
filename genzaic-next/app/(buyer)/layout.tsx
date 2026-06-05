import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"
import logo from "../../public/logo-b.png"
import { BuyerProfileMenu } from "@/components/layout/BuyerProfileMenu"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { PushOptInBanner } from "@/components/notifications/PushOptInBanner"

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // The session.user shape has been extended in lib/auth/config.ts to carry
  // `isSeller` + `role` (see ExtendedUser). The dropdown uses these to show a
  // "Seller dashboard" shortcut when applicable.
  const user = session.user as {
    name?: string | null
    email?: string | null
    image?: string | null
    isSeller?: boolean
    role?: string
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="Genzaic" className="w-8 h-8" />
            <span className="font-bold text-lg sm:text-xl">GenZaic</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/my-purchases"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">My Purchases</span>
            </Link>
            <NotificationBell />
            <BuyerProfileMenu user={user} />
          </nav>
        </div>
      </header>
      {/* <PushOptInBanner /> */}
      <main className="container mx-auto px-4 py-4 sm:py-8">{children}</main>
    </div>
  )
}
