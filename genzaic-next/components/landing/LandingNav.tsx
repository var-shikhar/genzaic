"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Menu, X } from "lucide-react"
import Image from "next/image"
import logo from "../../public/logo-b.png"
import { Button } from "@/components/ui/button"
import { useLandingCta } from "@/hooks/use-landing-cta"

const navLinks = [
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Pricing", id: "pricing" },
  { label: "Marketplace", id: "marketplace" },
]

export default function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cta = useLandingCta()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-sm" : "bg-transparent border-b border-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="Genzaic" className="w-8 h-8 sm:w-9 sm:h-9" />
          <span
            className={`font-display font-bold text-lg sm:text-xl transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}
          >
            GenZaic
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => scrollToSection(e, link.id)}
              className={`text-sm transition-colors duration-300 ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {cta.isAuthenticated ? (
            <Button
              size="sm"
              asChild
              className="gradient-primary hover:opacity-90 shadow-md shadow-primary/20 group"
            >
              <Link href={cta.href}>
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                {cta.navLabel}
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={
                  scrolled ? "" : "text-white hover:text-white hover:bg-white/10"
                }
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="gradient-primary hover:opacity-90 shadow-md shadow-primary/20"
              >
                <Link href="/signup?role=seller">Start Selling</Link>
              </Button>
            </>
          )}
        </div>
        <button
          className={`sm:hidden p-2 -mr-2 transition-colors duration-300 ${scrolled ? "text-muted-foreground" : "text-white"}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-border/30 flex gap-2">
                {cta.isAuthenticated ? (
                  <Button
                    size="sm"
                    asChild
                    className="flex-1 gradient-primary hover:opacity-90"
                  >
                    <Link href={cta.href}>
                      <LayoutDashboard className="w-4 h-4 mr-1.5" />
                      {cta.navLabel}
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      className="flex-1 gradient-primary hover:opacity-90"
                    >
                      <Link href="/signup?role=seller">Start Selling</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
