"use client"

import Link from "next/link"
import { ArrowRight, Check, Rocket, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovingBorderCard } from "@/components/ui/moving-border"
import { Reveal } from "@/components/motion/Reveal"
import { ParallaxLayer } from "@/components/motion/ParallaxLayer"

const planFeatures = [
  "Unlimited products",
  "Fast Setup",
  "Auto GST invoicing",
  "T+7 bank payouts",
  "UPI & card payments",
  "Custom storefront",
  "Secure file delivery",
  "Analytics dashboard",
  "Customer reviews",
  "Priority support",
]

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-16 sm:py-24 px-4 scroll-mt-20 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-10 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-green-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 left-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-primary/5 rounded-full blur-[100px]" />
      <div className="max-w-5xl mx-auto relative z-10">
        <Reveal from="fade-scale" className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs sm:text-sm font-semibold text-green-600">
              Zero Risk, Maximum Reward
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Start for <span className="text-green-500">{"₹"}0</span> —
            Pay Only When You Earn
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            No hidden fees. No monthly charges. We only succeed when you do.
          </p>
        </Reveal>
        <ParallaxLayer scaleRange={[0.98, 1.02]} className="max-w-lg mx-auto">
          <Reveal from="card">
            <MovingBorderCard
              borderRadius="1.5rem"
              className="overflow-hidden"
              duration={3000}
            >
              <div className="gradient-primary px-5 sm:px-8 py-5 text-center">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-0.5">
                  Creator Plan
                </h3>
                <p className="text-white/80 text-xs sm:text-sm">
                  Everything you need to start selling
                </p>
              </div>
              <div className="px-5 sm:px-8 py-8 text-center border-b border-border/60">
                <span className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-green-500">
                  {"₹"}0
                </span>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Setup Fee — Start Free Today!
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Pay a small commission only when you make a sale.
                </p>
              </div>
              <div className="px-5 sm:px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {planFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 sm:px-8 pb-6">
                <Button
                  size="lg"
                  asChild
                  className="w-full h-11 sm:h-12 text-sm sm:text-base gradient-primary hover:opacity-90 shadow-lg shadow-primary/25 group"
                >
                  <Link href="/signup">
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Selling — It&apos;s Free!
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-2.5">
                  No credit card required &bull; Setup in under 5 minutes
                </p>
              </div>
            </MovingBorderCard>
          </Reveal>
        </ParallaxLayer>
      </div>
    </section>
  )
}
