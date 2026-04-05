"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  Upload,
  Palette,
  CreditCard,
  Shield,
  Zap,
  Globe,
  FileText,
  Check,
  Sparkles,
  Store,
  Rocket,
  IndianRupee,
  Menu,
  X,
  Mail,
  Star,
  Users,
  Package,
  BarChart3,
  ChevronRight,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { MovingBorderCard } from "@/components/ui/moving-border"
import StorePreviewSection from "@/components/landing/StorePreviewSection"
import Footer from "@/components/layout/Footer"

/* ─── data ─── */
const testimonials = [
  {
    quote:
      "GenZaic made it so easy to set up my digital store. I was selling my design templates within 10 minutes of signing up!",
    name: "Priya Sharma",
    title: "UI/UX Designer, Bangalore",
  },
  {
    quote:
      "The auto GST invoicing saved me hours every month. Now I can focus on creating content instead of managing paperwork.",
    name: "Rahul Verma",
    title: "Course Creator, Delhi",
  },
  {
    quote:
      "I switched from Gumroad to GenZaic and my conversion rate doubled. UPI support makes a huge difference in India.",
    name: "Ananya Patel",
    title: "Template Designer, Mumbai",
  },
  {
    quote:
      "Finally a platform that understands Indian creators. The payouts are reliable and the dashboard is beautiful.",
    name: "Karthik Nair",
    title: "Developer & Educator, Chennai",
  },
  {
    quote:
      "My students love buying from my GenZaic store. The instant delivery and clean checkout flow keeps them coming back.",
    name: "Meera Joshi",
    title: "Yoga Instructor, Pune",
  },
]

const features = [
  {
    icon: Shield,
    title: "Bank-Grade KYC",
    desc: "PAN & bank account verification with military-grade encryption.",
    color: "from-blue-500/80 to-blue-600/80",
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Indian Payments",
    desc: "UPI, cards, net banking, wallets — every method your customers use.",
    color: "from-violet-500/80 to-purple-600/80",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    icon: FileText,
    title: "Auto GST Invoicing",
    desc: "Compliant invoices generated for every sale. Tax season? Handled.",
    color: "from-emerald-500/80 to-green-600/80",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Globe,
    title: "Custom Storefront",
    desc: "Your own branded store URL with customizable themes & layouts.",
    color: "from-pink-500/80 to-rose-600/80",
    iconBg: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Automatic secure file delivery the moment payment clears.",
    color: "from-amber-500/80 to-yellow-600/80",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track sales, views, downloads, and revenue in real-time.",
    color: "from-cyan-500/80 to-teal-600/80",
    iconBg: "bg-cyan-500/10 text-cyan-600",
  },
]

/* ─── animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Pricing", id: "pricing" },
    { label: "Marketplace", id: "marketplace" },
  ]

  return (
    <div
      className="min-h-screen bg-background scroll-smooth"
      style={{ overflowX: "clip" }}
    >
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-sm" : "bg-transparent border-b border-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-white font-bold text-base sm:text-lg">
                G
              </span>
            </div>
            <span
              className={`font-display font-bold text-lg sm:text-xl transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}
            >
              GenZaic
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`text-sm transition-colors duration-300 ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={
                scrolled ? "" : "text-white hover:text-white hover:bg-white/10"
              }
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="gradient-primary hover:opacity-90 shadow-md shadow-primary/20"
            >
              <Link href="/signup?role=seller">Start Selling</Link>
            </Button>
          </div>
          <button
            className={`sm:hidden p-2 -mr-2 transition-colors duration-300 ${scrolled ? "text-muted-foreground" : "text-white"}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => scrollToSection(e, link.id)}
                    className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-border/30 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="flex-1 gradient-primary hover:opacity-90"
                  >
                    <Link href="/signup?role=seller">Start Selling</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO — dark */}
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
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/signup?role=buyer">
                  <ShoppingBag className="mr-2 w-4 h-4" />
                  Browse Products
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex items-center justify-center gap-3 sm:gap-5 mt-8 text-xs sm:text-sm text-gray-400 flex-wrap px-4"
            >
              {[
                "Zero setup fees",
                "UPI & Card payments",
                "Auto GST invoicing",
                "Instant delivery",
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* STORE PREVIEW — Apple-style scroll-driven parallax */}
      <StorePreviewSection />

      {/* STATS — light */}
      <section className="pt-12 sm:pt-16 pb-10 sm:pb-14 bg-background bg-grid-pattern relative">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: "500+", label: "Active Creators", icon: Users },
              { value: "2,000+", label: "Products Listed", icon: Package },
              { value: "\u20B90", label: "Setup Fee", icon: IndianRupee },
              { value: "4.9/5", label: "Creator Rating", icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={i}
                className="text-center"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES — dark */}
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

      {/* HOW IT WORKS — light */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 px-4 scroll-mt-20 bg-background relative"
      >
        <div className="absolute inset-0 bg-cross-pattern" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-10 sm:mb-16"
          >
            <p className="text-xs sm:text-sm font-semibold text-primary mb-2 tracking-widest uppercase">
              Get Started
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
              Launch Your Store in{" "}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
              From sign-up to first sale in minutes. No technical skills
              required.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 rounded-full" />
            {[
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
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                custom={i}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — dark */}
      <section className="py-16 sm:py-24 relative overflow-hidden section-dark">
        <div className="absolute inset-0 bg-grid-pattern-light" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-xs sm:text-sm font-semibold text-purple-400 mb-2 tracking-widest uppercase">
              Testimonials
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Indian Creators
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
              Join hundreds of creators who trust GenZaic for their digital
              business.
            </p>
          </motion.div>
        </div>
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </section>

      {/* PRICING — light */}
      <section
        id="pricing"
        className="py-16 sm:py-24 px-4 scroll-mt-20 bg-background relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-10 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-green-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-primary/5 rounded-full blur-[100px]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs sm:text-sm font-semibold text-green-600">
                Zero Risk, Maximum Reward
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              Start for <span className="text-green-500">{"\u20B9"}0</span> —
              Pay Only When You Earn
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              No hidden fees. No monthly charges. We only succeed when you do.
            </p>
          </motion.div>
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-lg mx-auto"
          >
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
                  {"\u20B9"}0
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
                  {[
                    "Unlimited products",
                    "Unlimited sales",
                    "Auto GST invoicing",
                    "T+7 bank payouts",
                    "UPI & card payments",
                    "Custom storefront",
                    "Secure file delivery",
                    "Analytics dashboard",
                    "Customer reviews",
                    "Priority support",
                  ].map((feature, i) => (
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
          </motion.div>
        </div>
      </section>

      {/* MARKETPLACE — dark */}
      <section
        id="marketplace"
        className="py-16 sm:py-24 px-4 scroll-mt-20 section-dark relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-dot-pattern-dark" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center"
          >
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
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {[
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
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    className="text-center group"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs sm:text-sm text-gray-400 mb-3">
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
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA — light */}
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

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  )
}
