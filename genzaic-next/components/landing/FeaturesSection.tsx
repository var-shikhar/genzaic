"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  CreditCard,
  FileText,
  Globe,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { BackgroundBeams } from "@/components/ui/background-beams"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
}

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
  color: string
}

const features: Feature[] = [
  {
    icon: Shield,
    title: "Bank-Grade KYC",
    desc: "PAN & bank account verification with military-grade encryption.",
    color: "from-blue-500/80 to-blue-600/80",
  },
  {
    icon: CreditCard,
    title: "Indian Payments",
    desc: "UPI, cards, net banking, wallets — every method your customers use.",
    color: "from-violet-500/80 to-purple-600/80",
  },
  {
    icon: FileText,
    title: "Auto GST Invoicing",
    desc: "Compliant invoices generated for every sale. Tax season? Handled.",
    color: "from-emerald-500/80 to-green-600/80",
  },
  {
    icon: Globe,
    title: "Custom Storefront",
    desc: "Your own branded store URL with customizable themes & layouts.",
    color: "from-pink-500/80 to-rose-600/80",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Automatic secure file delivery the moment payment clears.",
    color: "from-amber-500/80 to-yellow-600/80",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track sales, views, downloads, and revenue in real-time.",
    color: "from-cyan-500/80 to-teal-600/80",
  },
]

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-16 sm:py-24 px-4 scroll-mt-20 section-dark relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dot-pattern-dark" />
      <BackgroundBeams className="opacity-30" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-xs sm:text-sm font-semibold text-purple-400 mb-2 tracking-widest uppercase">
            Features
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Sell Digital Products
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Built from the ground up for Indian creators. UPI payments, GST
            invoices, and more — all out of the box.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              custom={i}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 sm:p-6 hover:bg-white/10 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <f.icon className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="font-semibold text-white text-sm sm:text-base mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
