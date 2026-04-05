import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sparkles, LogOut, ShoppingBag, Settings } from "lucide-react"

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl">GenZaic</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/my-purchases" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-primary transition-colors">
              <ShoppingBag className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">My Purchases</span>
            </Link>
            <Link href="/my-purchases/settings" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }) }}>
              <button type="submit" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-4 sm:py-8">{children}</main>
    </div>
  )
}
