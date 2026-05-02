"use client"

import {
  CreditCard,
  Globe,
  Mail,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/Reveal"
import { RevealGroup } from "@/components/motion/RevealGroup"

interface MarketplacePerk {
  icon: LucideIcon
  title: string
  desc: string
}

const perks: MarketplacePerk[] = [
  {
    icon: Globe,
    title: "Reach Millions",
    desc: "Get discovered by buyers across India.",
  },
  {
    icon: Sparkles,
    title: "Featured Listings",
    desc: "Top products featured on homepage & socials.",
  },
  {
    icon: CreditCard,
    title: "Unified Payments",
    desc: "Same zero setup fee, same fast payouts.",
  },
]

export default function MarketplaceSection() {
  return (
    <section
      id="marketplace"
      className="py-16 sm:py-24 px-4 scroll-mt-20 section-dark relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dot-pattern-dark" />
      <div className="max-w-4xl mx-auto relative z-10">
        <Reveal from="fade-scale" className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-5">
            <Store className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs sm:text-sm font-semibold text-yellow-300">
              Coming Soon
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            GenZaic{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Discover and sell in India&apos;s first creator-focused
            marketplace. Get found by millions of buyers.
          </p>
        </Reveal>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 sm:p-8">
          <RevealGroup
            pattern="fan"
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
          >
            {perks.map((item, i) => (
              <div key={i} className="text-center group h-full">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </RevealGroup>
          <Reveal
            from="up-spring"
            delay={0.2}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <p className="text-xs sm:text-sm text-gray-400 mb-3 text-center">
              Be the first to know when we launch
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
              <Button className="w-full sm:w-auto gradient-primary hover:opacity-90 text-sm px-5">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Notify Me
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
