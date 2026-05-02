"use client"

import { IndianRupee, Package, Star, Users } from "lucide-react"
import { RevealGroup } from "@/components/motion/RevealGroup"
import { ParallaxLayer } from "@/components/motion/ParallaxLayer"

const stats = [
  { value: "500+", label: "Active Creators", icon: Users },
  { value: "2,000+", label: "Products Listed", icon: Package },
  { value: "₹0", label: "Setup Fee", icon: IndianRupee },
  { value: "4.9/5", label: "Creator Rating", icon: Star },
]

export default function StatsSection() {
  return (
    <section className="pt-12 sm:pt-16 pb-10 sm:pb-14 bg-background bg-grid-pattern relative">
      <div className="max-w-5xl mx-auto px-4">
        <ParallaxLayer speed={-0.1}>
          <RevealGroup
            pattern="fan"
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </RevealGroup>
        </ParallaxLayer>
      </div>
    </section>
  )
}
