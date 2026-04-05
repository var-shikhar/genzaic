import Link from "next/link"
import {
  Mail,
  Heart,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  Download,
} from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border/60">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                GenZaic
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              India&apos;s digital storefront for creators — sell PDFs, templates,
              code &amp; digital products with zero setup fees.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Pricing", href: "/#pricing" },
                { label: "Marketplace", href: "/#marketplace" },
                { label: "Disclaimer", href: "/disclaimer" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
              For Creators
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Start Selling", href: "/signup?role=seller" },
                { label: "Creator Dashboard", href: "/dashboard" },
                { label: "Upload Products", href: "/dashboard/products/new" },
                { label: "Manage Payouts", href: "/dashboard/payouts" },
                { label: "KYC Verification", href: "/dashboard/kyc" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@genzaic.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2.5"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  support@genzaic.com
                </a>
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2.5">
                <Heart className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                <span>Built for creators across India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-border/60">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: "SSL Secured",
                description: "256-bit encryption on all transactions",
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                icon: BadgeCheck,
                title: "GSTIN Verified",
                description: "Tax-compliant registered business",
                color: "text-blue-500 bg-blue-500/10",
              },
              {
                icon: Headphones,
                title: "Creator Support",
                description: "Dedicated help for all sellers",
                color: "text-amber-500 bg-amber-500/10",
              },
              {
                icon: Download,
                title: "Instant Delivery",
                description: "Secure download links on purchase",
                color: "text-violet-500 bg-violet-500/10",
              },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${badge.color} flex items-center justify-center flex-shrink-0`}
                >
                  <badge.icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                    {badge.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/60">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} GenZaic. All rights reserved.
              <span className="mx-1.5 text-border">|</span>
              Made with <span className="text-red-400">&hearts;</span> in India
              <span className="mx-1.5 text-border">|</span>
              Crafted by{" "}
              <a
                href="https://shikharvarshney.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors duration-200"
              >
                Shikhar
              </a>
            </p>
            <div className="flex items-center gap-4 sm:gap-5">
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="hover:text-foreground transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
