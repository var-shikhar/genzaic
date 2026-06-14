import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { HeaderGradientBorder } from "@/components/ui/header-gradient-border"

/**
 * Shared sticky header for public marketing/legal pages
 * (about, terms, privacy, refund, disclaimer). The fading gradient
 * border shows while the header is stuck to the top.
 */
export default function PublicPageHeader() {
  return (
    <nav className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <HeaderGradientBorder />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo width={100} height={20} />
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="gradient-primary hover:opacity-90 transition-opacity"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
