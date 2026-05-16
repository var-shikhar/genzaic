"use client"

import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/Reveal"
import { ParallaxLayer } from "@/components/motion/ParallaxLayer"
import { useLandingCta } from "@/hooks/use-landing-cta"

export default function CTASection() {
  const cta = useLandingCta()
  return (
    <>
      {/* Primary CTA — light */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-dot-pattern" />
        <ParallaxLayer
          speed={0.2}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none"
        />
        <div className="relative z-10 py-16 sm:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal from="fade-scale">
              {cta.isAuthenticated ? (
                <>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                    {cta.firstName ? (
                      <>
                        Welcome back,{" "}
                        <span className="gradient-text">{cta.firstName}!</span>
                      </>
                    ) : (
                      <>
                        <span className="gradient-text">Welcome back!</span>
                      </>
                    )}
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-8">
                    Pick up where you left off and keep building your digital
                    business on GenZaic.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                    Ready to <span className="gradient-text">Start Selling?</span>
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-8">
                    Join hundreds of creators building their digital business on
                    GenZaic.{" "}
                    <span className="font-bold text-foreground">
                      Zero setup fee — start today!
                    </span>
                  </p>
                </>
              )}
            </Reveal>
            <Reveal
              from="up-spring"
              delay={0.15}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              {cta.isAuthenticated ? (
                <Button
                  size="lg"
                  asChild
                  className="gradient-primary hover:opacity-90 text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto shadow-lg shadow-purple-500/20 group"
                >
                  <Link href={cta.href}>
                    {cta.label}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="gradient-primary hover:opacity-90 text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto shadow-lg shadow-purple-500/20 group"
                  >
                    <Link href="/signup">
                      Create Your Free Store
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto"
                  >
                    <Link href="/login">
                      Creator Login
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                  </Button>
                </>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Creator Journey CTA */}
      <section className="relative bg-background">
        <div className="absolute inset-0 bg-dot-pattern" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Reveal from="card">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 gradient-primary rounded-2xl px-6 sm:px-8 py-6 shadow-lg shadow-purple-500/20">
              <div className="text-center sm:text-left">
                <h3 className="font-display font-bold text-white text-base sm:text-lg mb-1">
                  {cta.isAuthenticated
                    ? "Jump back into your workspace"
                    : "Start your creator journey today"}
                </h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  {cta.isAuthenticated
                    ? "Your tools, products, and sales — all in one place."
                    : "Join 500+ creators selling on GenZaic. Zero setup fee."}
                </p>
              </div>
              <Button
                size="sm"
                asChild
                className="bg-white text-primary hover:bg-white/90 text-sm px-6 h-10 flex-shrink-0 group"
              >
                <Link href={cta.isAuthenticated ? cta.href : "/signup"}>
                  {cta.isAuthenticated ? cta.label : "Get Started Free"}
                  <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
