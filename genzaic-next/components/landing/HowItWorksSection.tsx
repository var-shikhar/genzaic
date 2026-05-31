"use client"

import { CreditCard, Palette, Upload, type LucideIcon } from "lucide-react"
import { Reveal } from "@/components/motion/Reveal"
import { RevealGroup } from "@/components/motion/RevealGroup"

interface Step {
  icon: LucideIcon
  title: string
  desc: string
  gradient: string
  step: string
}

const steps: Step[] = [
  {
    icon: Upload,
    title: "Upload Products",
    desc: "Add your digital products — PDFs, templates, code, designs. Set pricing in INR with categories and descriptions.",
    gradient: "from-violet-500 to-indigo-600",
    step: "01",
  },
  {
    icon: Palette,
    title: "Customize Store",
    desc: "Pick a theme, add brand colors, get a custom store URL. Works beautifully on every screen size.",
    gradient: "from-pink-500 to-rose-600",
    step: "02",
  },
  {
    icon: CreditCard,
    title: "Start Earning",
    desc: "Accept UPI, cards, and wallets instantly. Auto GST invoicing. Bank payouts within a week.",
    gradient: "from-orange-500 to-amber-500",
    step: "03",
  },
]

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 px-4 scroll-mt-20 bg-background relative"
    >
      <div className="absolute inset-0 bg-cross-pattern" />
      <div className="max-w-5xl mx-auto relative z-10">
        <Reveal from="fade-scale" className="text-center mb-10 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold text-primary mb-2 tracking-widest uppercase">
            Get Started
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
            Launch Your Store in{" "}
            <span className="gradient-text">3 Simple Steps</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            From sign-up to first sale in minutes. No technical skills required.
          </p>
        </Reveal>
        <div className="relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 rounded-full" />
          <RevealGroup
            pattern="cascade"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative"
          >
            {steps.map((item, i) => (
              <div key={i} className="relative group h-full">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/25 z-10">
                    {item.step}
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-5 mt-2 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
