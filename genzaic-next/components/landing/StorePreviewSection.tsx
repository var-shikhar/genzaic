"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { BadgeCheck, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

const products = [
  {
    title: "React UI Kit",
    price: "\u20B91,999",
    gradient: "from-violet-500 to-indigo-600",
    tag: "Best Seller",
    stars: 5,
    sales: "120+",
  },
  {
    title: "Business Templates",
    price: "\u20B9499",
    gradient: "from-pink-500 to-rose-600",
    tag: "New",
    stars: 4,
    sales: "45+",
  },
  {
    title: "Design System Pro",
    price: "\u20B92,499",
    gradient: "from-orange-500 to-amber-500",
    tag: "Popular",
    stars: 5,
    sales: "89+",
  },
]

export default function StorePreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Card: scale up from small → full as you scroll into view
  const cardScale = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.75, 1, 1])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const cardY = useTransform(scrollYProgress, [0, 0.3], [120, 0])
  const cardRotateX = useTransform(scrollYProgress, [0, 0.3], [8, 0])

  // Glow: pulses as card lands
  const glowOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.5], [0, 0.6, 0.3])
  const glowScale = useTransform(scrollYProgress, [0.15, 0.35], [0.8, 1.1])

  // Browser chrome: slides down into place
  const chromeY = useTransform(scrollYProgress, [0.1, 0.3], [-30, 0])
  const chromeOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1])

  // Store header: fades in after chrome
  const headerOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1])
  const headerX = useTransform(scrollYProgress, [0.2, 0.35], [-40, 0])

  // Products: stagger reveal from bottom
  const prod1Opacity = useTransform(scrollYProgress, [0.28, 0.38], [0, 1])
  const prod1Y = useTransform(scrollYProgress, [0.28, 0.38], [60, 0])
  const prod2Opacity = useTransform(scrollYProgress, [0.32, 0.42], [0, 1])
  const prod2Y = useTransform(scrollYProgress, [0.32, 0.42], [60, 0])
  const prod3Opacity = useTransform(scrollYProgress, [0.36, 0.46], [0, 1])
  const prod3Y = useTransform(scrollYProgress, [0.36, 0.46], [60, 0])

  const prodStyles = [
    { opacity: prod1Opacity, y: prod1Y },
    { opacity: prod2Opacity, y: prod2Y },
    { opacity: prod3Opacity, y: prod3Y },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative z-20 bg-background py-8 sm:py-12"
      style={{ minHeight: "80vh" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 sticky top-24">
        <motion.div
          style={{
            scale: cardScale,
            opacity: cardOpacity,
            y: cardY,
            rotateX: cardRotateX,
            transformPerspective: 1200,
          }}
          className="relative"
        >
          {/* Animated glow behind */}
          <motion.div
            style={{ opacity: glowOpacity, scale: glowScale }}
            className="absolute -inset-6 bg-gradient-to-b from-purple-500/20 via-purple-500/10 to-transparent rounded-[2rem] blur-3xl"
          />

          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(139,92,246,0.25)] overflow-hidden border border-gray-200/80 ring-1 ring-black/5">
            {/* Browser chrome */}
            <motion.div
              style={{ y: chromeY, opacity: chromeOpacity }}
              className="bg-gray-50 px-3 sm:px-5 py-2.5 flex items-center gap-2.5 border-b border-gray-200/80"
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 mx-4 hidden sm:block">
                <div className="bg-white rounded-lg px-4 py-1.5 text-[11px] text-gray-400 max-w-[220px] mx-auto text-center font-mono border border-gray-200 shadow-inner">
                  <span className="text-green-500 mr-1">&#128274;</span>{" "}
                  priya.genzaic.com
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-gray-200/80" />
                <div className="w-4 h-4 rounded bg-gray-200/80" />
              </div>
            </motion.div>

            {/* Store header */}
            <motion.div
              style={{ opacity: headerOpacity, x: headerX }}
              className="px-4 sm:px-8 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0 ring-2 ring-white shadow-md">
                  PS
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      Priya&apos;s Design Studio
                    </h3>
                    <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0 hidden sm:block" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                    Premium UI kits, templates &amp; design resources
                  </p>
                  <div className="items-center gap-3 mt-1 hidden sm:flex">
                    <span className="text-[10px] text-gray-400">
                      <span className="font-semibold text-gray-600">12</span>{" "}
                      products
                    </span>
                    <span className="text-[10px] text-gray-400">
                      <span className="font-semibold text-gray-600">1.2k</span>{" "}
                      followers
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{" "}
                      <span className="font-semibold text-gray-600">4.9</span>
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="ml-auto gradient-primary hover:opacity-90 text-[11px] sm:text-xs h-8 sm:h-9 px-4 shadow-sm hidden sm:flex"
                >
                  <Heart className="w-3 h-3 mr-1.5" />
                  Follow
                </Button>
              </div>
            </motion.div>

            {/* Products — staggered scroll reveal */}
            <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50/80 to-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={i}
                    style={prodStyles[i]}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden"
                  >
                    <div className="relative overflow-hidden">
                      <div
                        className={`h-24 sm:h-32 bg-gradient-to-br ${product.gradient} group-hover:scale-110 transition-transform duration-500`}
                      />
                      <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-bold bg-white text-gray-700 px-2 py-0.5 rounded-full shadow-sm">
                        {product.tag}
                      </span>
                    </div>
                    <div className="p-3 sm:p-3.5">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {Array.from({ length: product.stars }).map((_, j) => (
                          <Star
                            key={j}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-[9px] sm:text-[10px] text-gray-400 ml-1">
                          {product.sales} sold
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-purple-600 font-bold text-sm sm:text-base">
                          {product.price}
                        </p>
                        <span className="text-[9px] sm:text-[10px] text-purple-500 font-medium hidden sm:block">
                          View &rarr;
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
