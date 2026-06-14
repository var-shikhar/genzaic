import Link from "next/link"
import {
  Mail,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  Download,
  Heart,
  MapPin,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import logoFull from "../../public/logo.png"

const linkColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Marketplace", href: "/#marketplace" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    title: "For Creators",
    links: [
      { label: "Start Selling", href: "/signup?role=seller" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Login", href: "/login" },
    ],
  },
]

const legalLinks = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund", href: "/refund-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
]

const trustBadges = [
  {
    icon: ShieldCheck,
    title: "SSL Secured",
    desc: "256-bit encryption on all transactions",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: BadgeCheck,
    title: "GSTIN Verified",
    desc: "Tax-compliant registered business",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Headphones,
    title: "Creator Support",
    desc: "Dedicated help for all sellers",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Download,
    title: "Instant Delivery",
    desc: "Secure download links on purchase",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
]

const socials = [
  {
    label: "Twitter",
    path: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
  },
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "YouTube",
    path: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
  },
]

export default function Footer() {
  return (
    <footer className="section-dark-alt relative">
      {/* Gradient top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      <div className="absolute inset-0 bg-dot-pattern-dark" />

      {/* Newsletter strip */}
      <div className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-8">
            <div className="text-center sm:text-left">
              <h3 className="font-display font-bold text-white text-base sm:text-lg mb-1">
                Stay in the loop
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Get updates on new features, creator tips, and platform news.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-56 px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
              <button className="gradient-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 flex-shrink-0">
                Subscribe
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer — 3 tabs: Brand | Product | Start Selling */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand — spans 2 cols */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-2">
              <Image src={logoFull} alt="Genzaic" width={100} height={20} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              India&apos;s no. first digital storefront for creators — sell
              PDFs, templates, code &amp; digital products with zero setup fees.
              UPI-ready, GST-ready.
            </p>
            <div className="flex items-center gap-2.5 mb-5">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-purple-500/20 hover:text-purple-400 border border-white/[0.06] flex items-center justify-center text-gray-400 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <a
                href="mailto:support@genzaic.com"
                className="text-xs sm:text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-purple-400/60" />
                support@genzaic.com
              </a>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-purple-400/60" />
                Built for creators across India
              </p>
            </div>
          </div>

          {/* Product & Start Selling columns */}
          {linkColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-white mb-5 text-base sm:text-lg tracking-tight">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.04] px-3 py-3"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${badge.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-200 leading-tight">
                    {badge.title}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5 hidden sm:block">
                    {badge.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar — copyright left, legal links right */}
      <div className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between text-xs text-gray-500">
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-0">
              <span>
                &copy; {new Date().getFullYear()} GenZaic. All rights reserved.
              </span>
              <span className="hidden sm:inline mx-1.5 text-gray-700">
                &bull;
              </span>
              <span className="flex items-center gap-1">
                Made with{" "}
                <Heart className="w-3 h-3 text-red-400 fill-red-400" /> in India
              </span>
              <span className="hidden sm:inline mx-1.5 text-gray-700">
                &bull;
              </span>
              <span>
                Crafted by{" "}
                <a
                  href="https://shikharvarshney.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Shikhar
                </a>
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-5">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-gray-500 hover:text-purple-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
