"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  Check,
  IndianRupee,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

const heroBenefits = [
  "Zero setup fees",
  "UPI & Card payments",
  "Auto GST invoicing",
  "Instant delivery",
]

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={heroRef} className="relative section-dark">
      <div className="overflow-hidden absolute inset-0">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(139,92,246,0.35)"
        />
        <div className="absolute inset-0 bg-grid-pattern-light" />
        {/* Animated background gradient */}
        <div className="absolute inset-0 hero-gradient-animate" />
        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 80, -60, 0],
            y: [0, -70, 50, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] w-72 sm:w-[400px] h-72 sm:h-[400px] bg-purple-600/30 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -70, 60, 0],
            y: [0, 60, -80, 0],
            scale: [1, 0.8, 1.25, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[5%] w-80 sm:w-[450px] h-80 sm:h-[450px] bg-indigo-500/25 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, 50, -40, 0],
            y: [0, -50, 40, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 sm:w-[350px] h-60 sm:h-[350px] bg-pink-500/20 rounded-full blur-[80px]"
        />
      </div>

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 py-28 sm:py-36 px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 mb-6 sm:mb-8 backdrop-blur-sm"
          >
            <IndianRupee className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-green-300">
              Zero Setup Fee — Start Free Today!
            </span>
          </motion.div>

          <TextGenerateEffect
            words="Sell Digital Products. Build & Grow Your Online Store."
            highlightWords={["Digital", "Products.", "Store."]}
            highlightClassName="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]"
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-white mb-4 sm:mb-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto mt-4 sm:mt-6 mb-8 sm:mb-10 leading-relaxed px-2"
          >
            The all-in-one platform for Indian creators to sell PDFs,
            templates, code &amp; digital products.{" "}
            <span className="text-white font-semibold">
              Create your store. Accept UPI. Get paid.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <Button
              size="lg"
              asChild
              className="gradient-primary hover:opacity-90 text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto shadow-lg shadow-purple-500/30 group"
            >
              <Link href="/signup">
                Start Selling Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="flex items-center justify-center gap-3 sm:gap-5 mt-8 text-xs sm:text-sm text-gray-400 flex-wrap px-4"
          >
            {heroBenefits.map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
