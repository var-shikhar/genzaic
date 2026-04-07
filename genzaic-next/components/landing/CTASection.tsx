"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
}

export default function CTASection() {
  return (
    <>
      {/* Primary CTA — light */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-dot-pattern" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="relative z-10 py-16 sm:py-24 px-4">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creator Journey CTA */}
      <section className="relative bg-background">
        <div className="absolute inset-0 bg-dot-pattern" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 gradient-primary rounded-2xl px-6 sm:px-8 py-6 shadow-lg shadow-purple-500/20">
            <div className="text-center sm:text-left">
              <h3 className="font-display font-bold text-white text-base sm:text-lg mb-1">
                Start your creator journey today
              </h3>
              <p className="text-white/70 text-xs sm:text-sm">
                Join 500+ creators selling on GenZaic. Zero setup fee.
              </p>
            </div>
            <Button
              size="sm"
              asChild
              className="bg-white text-primary hover:bg-white/90 text-sm px-6 h-10 flex-shrink-0 group"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
