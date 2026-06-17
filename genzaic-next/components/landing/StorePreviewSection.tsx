"use client"

import { motion, MotionValue, useScroll, useTransform } from "framer-motion"
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  Download,
  File,
  FileText,
  HardDrive,
  Heart,
  IndianRupee,
  Mail,
  MessageSquare,
  Package,
  Receipt,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  ThumbsUp,
  User
} from "lucide-react"
import { useRef } from "react"

const storeProducts = [
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
  {
    title: "Landing Page Kit",
    price: "\u20B9799",
    gradient: "from-teal-500 to-cyan-600",
    tag: "Trending",
    stars: 5,
    sales: "67+",
  },
  {
    title: "Icon Pack Pro",
    price: "\u20B9299",
    gradient: "from-fuchsia-500 to-purple-600",
    tag: "Hot",
    stars: 4,
    sales: "230+",
  },
  {
    title: "Notion Templates",
    price: "\u20B9399",
    gradient: "from-emerald-500 to-green-600",
    tag: "Featured",
    stars: 5,
    sales: "95+",
  },
]

/* helper: proper custom hook for stagger animations */
function useStagger(
  progress: MotionValue<number>,
  base: number,
  count: number,
  gap = 0.015,
  dur = 0.025,
) {
  // Pre-compute all ranges (no hooks here)
  const ranges = Array.from({ length: count }, (_, i) => base + i * gap)

  // Call hooks unconditionally at top level — fixed count per call site
  const o0 = useTransform(progress, [ranges[0] ?? 0, (ranges[0] ?? 0) + dur], [0, 1])
  const y0 = useTransform(progress, [ranges[0] ?? 0, (ranges[0] ?? 0) + dur], [30, 0])
  const o1 = useTransform(progress, [ranges[1] ?? 0, (ranges[1] ?? 0) + dur], [0, 1])
  const y1 = useTransform(progress, [ranges[1] ?? 0, (ranges[1] ?? 0) + dur], [30, 0])
  const o2 = useTransform(progress, [ranges[2] ?? 0, (ranges[2] ?? 0) + dur], [0, 1])
  const y2 = useTransform(progress, [ranges[2] ?? 0, (ranges[2] ?? 0) + dur], [30, 0])
  const o3 = useTransform(progress, [ranges[3] ?? 0, (ranges[3] ?? 0) + dur], [0, 1])
  const y3 = useTransform(progress, [ranges[3] ?? 0, (ranges[3] ?? 0) + dur], [30, 0])
  const o4 = useTransform(progress, [ranges[4] ?? 0, (ranges[4] ?? 0) + dur], [0, 1])
  const y4 = useTransform(progress, [ranges[4] ?? 0, (ranges[4] ?? 0) + dur], [30, 0])
  const o5 = useTransform(progress, [ranges[5] ?? 0, (ranges[5] ?? 0) + dur], [0, 1])
  const y5 = useTransform(progress, [ranges[5] ?? 0, (ranges[5] ?? 0) + dur], [30, 0])

  const all = [
    { opacity: o0, y: y0 }, { opacity: o1, y: y1 }, { opacity: o2, y: y2 },
    { opacity: o3, y: y3 }, { opacity: o4, y: y4 }, { opacity: o5, y: y5 },
  ]
  return all.slice(0, count)
}

export default function StorePreviewSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  /* ── Timeline (0→1 over 800vh) ──
   * 0.00–0.03  Card enters
   * 0.03–0.16  1. Browse Store
   * 0.16–0.22  Cursor clicks, transition
   * 0.22–0.34  2. Product Detail
   * 0.34–0.44  3. Checkout Summary
   * 0.44–0.54  4. Payment
   * 0.54–0.66  5. Order Confirmed
   * 0.66–0.78  6. Download Files
   * 0.78–0.96  7. Rate & Review
   */

  // Card entrance
  const cardScale = useTransform(p, [0, 0.02], [0.88, 1])
  const cardY = useTransform(p, [0, 0.02], [40, 0])
  const cardOpacity = useTransform(p, [0, 0.015], [0, 1])

  // URL: 0=store 1=product 2=checkout 3=payment 4=order 5=download
  const url = useTransform(p, [0, 0.15, 0.28, 0.38, 0.49, 0.63, 0.75], [0, 0, 1, 2, 3, 4, 5])

  // ── 1. Store (0.02 → 0.15) — 13% ──
  const s1o = useTransform(p, [0.02, 0.04, 0.13, 0.15], [0, 1, 1, 0])
  const s1x = useTransform(p, [0.13, 0.15], [0, -40])
  const prodAnim = useStagger(p, 0.04, 6, 0.012, 0.02)
  const cursorX = useTransform(p, [0.1, 0.13], [200, 60])
  const cursorY = useTransform(p, [0.1, 0.13], [20, 70])
  const cursorO = useTransform(p, [0.09, 0.11, 0.14, 0.15], [0, 1, 1, 0])
  const cursorS = useTransform(p, [0.13, 0.14, 0.145], [1, 0.7, 1])
  const hlO = useTransform(p, [0.12, 0.14, 0.15], [0, 1, 0])

  // ── 2. Product Detail (0.16 → 0.28) — 12% ──
  const s2o = useTransform(p, [0.16, 0.18, 0.26, 0.28], [0, 1, 1, 0])
  const s2x = useTransform(p, [0.16, 0.19], [50, 0])
  const d_info = useTransform(p, [0.19, 0.21], [0, 1])
  const d_infoY = useTransform(p, [0.19, 0.21], [15, 0])
  const d_feat = useTransform(p, [0.21, 0.23], [0, 1])
  const d_featY = useTransform(p, [0.21, 0.23], [12, 0])
  const d_btn = useTransform(p, [0.23, 0.25], [0, 1])
  const d_btnS = useTransform(p, [0.23, 0.25], [0.9, 1])
  const d_curO = useTransform(p, [0.25, 0.255, 0.27, 0.28], [0, 1, 1, 0])
  const d_curY = useTransform(p, [0.255, 0.27], [-12, 4])
  const d_pulse = useTransform(p, [0.26, 0.27, 0.28], [1, 0.95, 1])

  // ── 3. Checkout (0.29 → 0.38) — 9% ──
  const s3o = useTransform(p, [0.29, 0.31, 0.36, 0.38], [0, 1, 1, 0])
  const s3y = useTransform(p, [0.29, 0.32], [50, 0])
  const ck_email = useTransform(p, [0.32, 0.34], [0, 1])
  const ck_coupon = useTransform(p, [0.34, 0.36], [0, 1])
  const ck_btn = useTransform(p, [0.36, 0.375], [0, 1])
  const ck_btnS = useTransform(p, [0.36, 0.375], [0.9, 1])

  // ── 4. Payment (0.39 → 0.48) — 9% ──
  const s4o = useTransform(p, [0.39, 0.41, 0.46, 0.48], [0, 1, 1, 0])
  const s4y = useTransform(p, [0.39, 0.42], [50, 0])
  const pay1 = useTransform(p, [0.42, 0.44], [0, 1])
  const pay2 = useTransform(p, [0.44, 0.46], [0, 1])
  const pay3 = useTransform(p, [0.46, 0.48], [0, 1])
  const spin = useTransform(p, [0.45, 0.49], [0, 360])

  // ── 5. Order Confirmed (0.49 → 0.62) — 13% ──
  const s5o = useTransform(p, [0.49, 0.51, 0.6, 0.62], [0, 1, 1, 0])
  const chkS = useTransform(p, [0.51, 0.54], [0, 1.15])
  const chkS2 = useTransform(p, [0.54, 0.55], [1.15, 1])
  const chkR = useTransform(p, [0.51, 0.54], [-180, 0])
  const chkRing1 = useTransform(p, [0.53, 0.56], [0.5, 1.8])
  const chkRing1O = useTransform(p, [0.53, 0.56], [0.6, 0])
  const chkRing2 = useTransform(p, [0.54, 0.57], [0.5, 2.2])
  const chkRing2O = useTransform(p, [0.54, 0.57], [0.4, 0])
  const chkGlow = useTransform(p, [0.52, 0.55, 0.59], [0, 1, 0.3])
  const confetti = useTransform(p, [0.53, 0.55, 0.6, 0.62], [0, 1, 1, 0])
  const ord_info = useTransform(p, [0.55, 0.57], [0, 1])
  const ord_infoY = useTransform(p, [0.55, 0.57], [15, 0])
  const ord_timeline = useStagger(p, 0.56, 4, 0.012, 0.02)

  // ── 6. Download (0.63 → 0.74) — 11% ──
  const s6o = useTransform(p, [0.63, 0.65, 0.72, 0.74], [0, 1, 1, 0])
  const s6y = useTransform(p, [0.63, 0.66], [40, 0])
  const dl_files = useStagger(p, 0.66, 3, 0.015, 0.02)
  const dl_bar = useTransform(p, [0.69, 0.72], [0, 100])
  const dl_done = useTransform(p, [0.72, 0.74], [0, 1])
  const dl_doneS = useTransform(p, [0.72, 0.74], [0.8, 1])

  // ── 7. Review (0.75 → 0.885) ──
  // Hold at full opacity until 0.875 so every reveal below (stars → text →
  // button, ending at 0.87) lands while the scene is fully visible, then fade.
  const s7o = useTransform(p, [0.75, 0.77, 0.875, 0.885], [0, 1, 1, 0])
  const s7y = useTransform(p, [0.75, 0.78], [40, 0])
  const star0 = useTransform(p, [0.79, 0.80], [0, 1])
  const star1 = useTransform(p, [0.80, 0.81], [0, 1])
  const star2 = useTransform(p, [0.81, 0.82], [0, 1])
  const star3 = useTransform(p, [0.82, 0.83], [0, 1])
  const star4 = useTransform(p, [0.83, 0.84], [0, 1])
  const stars = [star0, star1, star2, star3, star4]
  const rv_text = useTransform(p, [0.84, 0.86], [0, 1])
  const rv_btn = useTransform(p, [0.86, 0.87], [0, 1])
  const rv_btnS = useTransform(p, [0.86, 0.87], [0.9, 1])

  // ── 8. Closing (0.885 → 1.0) — terminal state, holds at full opacity ──
  const s8o = useTransform(p, [0.885, 0.895], [0, 1])
  const s8scale = useTransform(p, [0.885, 0.91], [0.9, 1])
  const s8sparkle = useTransform(p, [0.92, 0.95], [0, 1])

  // Phase labels
  const phases = [
    { o: useTransform(p, [0.02, 0.04, 0.13, 0.15], [0, 1, 1, 0]), t: "Browse the Store", c: "text-primary bg-primary/10 border-primary/20" },
    { o: useTransform(p, [0.16, 0.18, 0.26, 0.28], [0, 1, 1, 0]), t: "View Product", c: "text-primary bg-primary/10 border-primary/20" },
    { o: useTransform(p, [0.29, 0.31, 0.36, 0.38], [0, 1, 1, 0]), t: "Checkout", c: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { o: useTransform(p, [0.39, 0.41, 0.46, 0.48], [0, 1, 1, 0]), t: "Payment", c: "text-amber-600 bg-amber-50 border-amber-200" },
    { o: useTransform(p, [0.49, 0.51, 0.6, 0.62], [0, 1, 1, 0]), t: "Order Confirmed!", c: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { o: useTransform(p, [0.63, 0.65, 0.72, 0.74], [0, 1, 1, 0]), t: "Download Files", c: "text-blue-600 bg-blue-50 border-blue-200" },
    { o: useTransform(p, [0.75, 0.77, 0.875, 0.885], [0, 1, 1, 0]), t: "Leave a Review", c: "text-purple-600 bg-purple-50 border-purple-200" },
    { o: useTransform(p, [0.885, 0.895], [0, 1]), t: "You're all set!", c: "text-foreground bg-primary/10 border-primary/20" },
  ]

  // Download bar derived values (pre-computed at top level)
  const dl_barPercent = useTransform(dl_bar, (v) => `${Math.round(v)}%`)
  const dl_barWidth = useTransform(dl_bar, (v) => `${v}%`)

  /* ── URL text — pre-computed opacities ── */
  const urlTexts = [
    "priya.genzaic.com",
    "priya.genzaic.com/react-ui-kit",
    "genzaic.com/checkout",
    "genzaic.com/pay/GZ-7842",
    "genzaic.com/order/GZ-7842",
    "genzaic.com/download/GZ-7842",
  ]
  const urlRanges: [number, number][] = [[0, 0.5], [0.5, 1.5], [1.5, 2.5], [2.5, 3.5], [3.5, 4.5], [4.5, 5.5]]
  const urlO0 = useTransform(url, [urlRanges[0][0], urlRanges[0][0] + 0.3, urlRanges[0][1] - 0.3, urlRanges[0][1]], [0, 1, 1, 0])
  const urlO1 = useTransform(url, [urlRanges[1][0], urlRanges[1][0] + 0.3, urlRanges[1][1] - 0.3, urlRanges[1][1]], [0, 1, 1, 0])
  const urlO2 = useTransform(url, [urlRanges[2][0], urlRanges[2][0] + 0.3, urlRanges[2][1] - 0.3, urlRanges[2][1]], [0, 1, 1, 0])
  const urlO3 = useTransform(url, [urlRanges[3][0], urlRanges[3][0] + 0.3, urlRanges[3][1] - 0.3, urlRanges[3][1]], [0, 1, 1, 0])
  const urlO4 = useTransform(url, [urlRanges[4][0], urlRanges[4][0] + 0.3, urlRanges[4][1] - 0.3, urlRanges[4][1]], [0, 1, 1, 0])
  const urlO5 = useTransform(url, [urlRanges[5][0], urlRanges[5][0] + 0.3, urlRanges[5][1] - 0.3, urlRanges[5][1]], [0, 1, 1, 0])
  const urlOpacities = [urlO0, urlO1, urlO2, urlO3, urlO4, urlO5]

  return (
    // Scroll-jack length scales with viewport. On phones a 1400vh section is
    // ~14 screens of mostly-empty scroll, so we compress the same 8-phase
    // animation into far less scroll distance on small screens and only open
    // it up to the full cinematic length on large screens.
    <section
      ref={ref}
      className="relative z-20 h-[600vh] sm:h-[900vh] lg:h-[1400vh]"
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Phase labels */}
        <div className="absolute top-5 sm:top-7 left-1/2 -translate-x-1/2 z-30">
          {phases.map((ph, i) => (
            <motion.span
              key={i}
              style={{ opacity: ph.o }}
              className={`absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs sm:text-sm font-semibold ${ph.c} border px-4 py-1.5 rounded-full`}
            >
              {ph.t}
            </motion.span>
          ))}
        </div>

        {/* ═══ BROWSER ═══ */}
        <motion.div
          style={{ scale: cardScale, y: cardY, opacity: cardOpacity }}
          className="max-w-4xl w-full"
        >
          <div className="bg-white rounded-2xl shadow-[0_20px_80px_-15px_rgba(139,92,246,0.2)] border border-gray-200/80 ring-1 ring-black/5 overflow-hidden">
            {/* Chrome */}
            <div className="bg-gray-50 px-3 sm:px-5 py-2.5 flex items-center gap-2.5 border-b border-gray-200/80">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 mx-4 hidden sm:block">
                <div className="bg-white rounded-lg px-4 py-1.5 text-[11px] text-gray-400 max-w-[320px] mx-auto text-center font-mono border border-gray-200 shadow-inner overflow-hidden relative h-5 flex items-center justify-center">
                  <span className="text-green-500 mr-1">&#128274;</span>
                  <span className="relative">
                    {urlTexts.map((text, i) => (
                      <motion.span
                        key={i}
                        style={{ opacity: urlOpacities[i] }}
                        className={`${i < urlTexts.length - 1 ? "absolute left-0" : ""} whitespace-nowrap`}
                      >
                        {text}
                      </motion.span>
                    ))}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-gray-200/80" />
                <div className="w-4 h-4 rounded bg-gray-200/80" />
              </div>
            </div>

            {/* Content */}
            <div
              className="relative"
              style={{ height: "clamp(480px, 70vh, 650px)" }}
            >
              {/* ── 1. STORE ── */}
              <motion.div
                style={{ opacity: s1o, x: s1x }}
                className="absolute inset-0 overflow-hidden"
              >
                <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white shadow-md">
                      PS
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                          Priya&apos;s Design Studio
                        </h3>
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-500">
                        Premium UI kits, templates &amp; design resources
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-gray-400">
                          <span className="font-semibold text-gray-600">
                            12
                          </span>{" "}
                          products
                        </span>
                        <span className="text-[10px] text-gray-400">
                          <span className="font-semibold text-gray-600">
                            1.2k
                          </span>{" "}
                          followers
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-600">
                            4.9
                          </span>
                        </span>
                      </div>
                    </div>
                    <button className="gradient-primary text-white text-[10px] sm:text-[11px] h-7 sm:h-8 px-3 rounded-md font-medium hidden sm:flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Follow
                    </button>
                  </div>
                </div>
                <div className="px-4 sm:px-6 py-2 border-b border-gray-100 bg-white flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200">
                    <Search className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] sm:text-[11px] text-gray-400">
                      Search products...
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    {["All", "Templates", "UI Kits", "Code"].map((c) => (
                      <span
                        key={c}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${c === "All" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-b from-gray-50 to-white">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {storeProducts.map((pr, i) => (
                      <motion.div
                        key={i}
                        style={prodAnim[i]}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative"
                      >
                        {i === 0 && (
                          <motion.div
                            style={{ opacity: hlO }}
                            className="absolute inset-0 rounded-xl ring-2 ring-purple-500 ring-offset-1 z-10 pointer-events-none"
                          />
                        )}
                        <div className="relative">
                          <div
                            className={`h-20 sm:h-28 bg-gradient-to-br ${pr.gradient}`}
                          />
                          <span className="absolute top-1.5 right-1.5 text-[7px] sm:text-[8px] font-bold bg-white text-gray-700 px-1.5 py-0.5 rounded-full shadow-sm">
                            {pr.tag}
                          </span>
                        </div>
                        <div className="p-2 sm:p-2.5">
                          <h4 className="font-semibold text-gray-900 text-[10px] sm:text-[11px] truncate">
                            {pr.title}
                          </h4>
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: pr.stars }).map((_, j) => (
                              <Star
                                key={j}
                                className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            <span className="text-[7px] sm:text-[8px] text-gray-400 ml-0.5">
                              {pr.sales}
                            </span>
                          </div>
                          <p className="text-purple-600 font-bold text-[11px] sm:text-xs mt-1">
                            {pr.price}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <motion.div
                  style={{
                    opacity: cursorO,
                    x: cursorX,
                    y: cursorY,
                    scale: cursorS,
                  }}
                  className="absolute z-20 pointer-events-none"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 3L19 12L12 13L9 20L5 3Z"
                      fill="rgba(139,92,246,0.9)"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  </svg>
                </motion.div>
              </motion.div>

              {/* ── 2. PRODUCT DETAIL ── */}
              <motion.div
                style={{ opacity: s2o, x: s2x }}
                className="absolute inset-0 bg-white overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to store
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="h-44 sm:h-56 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="text-center text-white/90">
                          <Package className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-1.5 opacity-80" />
                          <p className="text-[11px] sm:text-sm font-medium">
                            React UI Kit
                          </p>
                          <p className="text-[9px] sm:text-xs text-white/60 mt-0.5">
                            v2.4 &bull; 50+ components
                          </p>
                        </div>
                        <span className="absolute top-2.5 left-2.5 text-[9px] font-bold bg-white text-gray-700 px-2 py-0.5 rounded-full shadow-sm">
                          Best Seller
                        </span>
                      </div>
                      <div className="flex gap-1.5 mt-2.5">
                        {[0, 1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className={`h-10 sm:h-12 flex-1 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 ${j === 0 ? "ring-2 ring-purple-500 ring-offset-1" : "opacity-40"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <motion.div style={{ opacity: d_info, y: d_infoY }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] sm:text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">
                          Templates
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{" "}
                          4.9 (48)
                        </span>
                      </div>
                      <h2 className="font-bold text-gray-900 text-base sm:text-xl leading-tight">
                        React UI Kit
                      </h2>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 mb-3 leading-relaxed">
                        50+ production-ready React components, 12 page
                        templates, and a complete design system. Built with
                        Tailwind CSS &amp; TypeScript.
                      </p>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl sm:text-2xl font-bold text-purple-600">
                          {"\u20B9"}1,999
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {"\u20B9"}3,499
                        </span>
                        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                          43% OFF
                        </span>
                      </div>
                      <motion.div
                        style={{ opacity: d_feat, y: d_featY }}
                        className="space-y-2 mb-4"
                      >
                        {[
                          {
                            icon: FileText,
                            t: "50+ React components included",
                          },
                          {
                            icon: Download,
                            t: "Instant download after purchase",
                          },
                          { icon: Shield, t: "Lifetime access & free updates" },
                          { icon: Clock, t: "30-day money-back guarantee" },
                        ].map((f, k) => (
                          <div key={k} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <f.icon className="w-3 h-3 text-purple-500" />
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-600">
                              {f.t}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                      <motion.div style={{ opacity: d_btn, scale: d_btnS }}>
                        <motion.button
                          style={{ scale: d_pulse }}
                          className="w-full gradient-primary text-white font-semibold text-xs sm:text-sm h-10 sm:h-11 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 relative"
                        >
                          <ShoppingCart className="w-4 h-4" /> Buy Now —{" "}
                          {"\u20B9"}1,999
                          <motion.div
                            style={{ opacity: d_curO, y: d_curY }}
                            className="absolute -bottom-3 right-8 pointer-events-none"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 3L19 12L12 13L9 20L5 3Z"
                                fill="rgba(139,92,246,0.9)"
                                stroke="white"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </motion.div>
                        </motion.button>
                        <div className="flex items-center justify-center gap-4 mt-2 text-[9px] sm:text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Secure
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> UPI &amp; Cards
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* ── 3. CHECKOUT ── */}
              <motion.div
                style={{ opacity: s3o, y: s3y }}
                className="absolute inset-0 bg-white overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </div>
                  <span className="text-xs font-semibold text-gray-800">
                    Checkout
                  </span>
                  <div className="w-12" />
                </div>
                <div className="p-4 sm:p-6 max-w-md mx-auto">
                  {/* Order summary */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Order Summary
                    </p>
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                          React UI Kit
                        </p>
                        <p className="text-[10px] text-gray-500">
                          by Priya&apos;s Design Studio
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {"\u20B9"}1,999
                      </p>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-700">{"\u20B9"}1,999</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">GST (18%)</span>
                        <span className="text-gray-700">{"\u20B9"}360</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-purple-600">{"\u20B9"}2,359</span>
                      </div>
                    </div>
                  </div>
                  {/* Email */}
                  <motion.div style={{ opacity: ck_email }} className="mb-3">
                    <p className="text-[11px] font-medium text-gray-700 mb-1.5">
                      Email for delivery
                    </p>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-700">
                        rahul@gmail.com
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
                    </div>
                  </motion.div>
                  {/* Coupon */}
                  <motion.div style={{ opacity: ck_coupon }} className="mb-5">
                    <p className="text-[11px] font-medium text-gray-700 mb-1.5">
                      Coupon code
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-green-300 ring-1 ring-green-100">
                        <Tag className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-green-700 font-semibold">
                          WELCOME20
                        </span>
                      </div>
                      <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200">
                        -{"\u20B9"}400 Applied!
                      </span>
                    </div>
                  </motion.div>
                  {/* Pay button */}
                  <motion.div style={{ opacity: ck_btn, scale: ck_btnS }}>
                    <button className="w-full gradient-primary text-white font-semibold text-xs sm:text-sm h-10 sm:h-11 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                      <CreditCard className="w-4 h-4" /> Pay {"\u20B9"}1,959
                    </button>
                    <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" /> SSL Secured
                      </span>
                      <span className="flex items-center gap-1">
                        <Receipt className="w-3 h-3" /> GST Invoice
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* ── 4. PAYMENT ── */}
              <motion.div
                style={{ opacity: s4o, y: s4y }}
                className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden"
              >
                <div className="w-full max-w-sm mx-auto px-4 text-center">
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sm:p-6">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <IndianRupee className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">
                      Processing Payment
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-5">
                      {"\u20B9"}1,959 &bull; React UI Kit
                    </p>
                    <div className="space-y-3 text-left">
                      <motion.div
                        style={{ opacity: pay1 }}
                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">
                            UPI Payment
                          </p>
                          <p className="text-[10px] text-gray-400">
                            user@paytm
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                      <motion.div
                        style={{ opacity: pay2 }}
                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">
                            Verifying
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Secured by Razorpay
                          </p>
                        </div>
                        <motion.div
                          style={{ rotate: spin }}
                          className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full"
                        />
                      </motion.div>
                      <motion.div
                        style={{ opacity: pay3 }}
                        className="flex items-center gap-3 rounded-xl p-3 border border-green-100 bg-green-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-700">
                            Payment successful!
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {"\u20B9"}1,959 debited
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── 5. ORDER CONFIRMED ── */}
              <motion.div
                style={{ opacity: s5o }}
                className="absolute inset-0 bg-gradient-to-b from-green-50 to-white overflow-hidden"
              >
                <motion.div
                  style={{ opacity: confetti }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {[
                    "top-3 left-[10%] bg-purple-400 w-2 h-2",
                    "top-6 left-[25%] bg-pink-400 w-1.5 h-1.5",
                    "top-2 left-[45%] bg-yellow-400 w-2 h-2",
                    "top-5 left-[65%] bg-green-400 w-1.5 h-1.5",
                    "top-8 left-[80%] bg-blue-400 w-2 h-2",
                    "top-10 left-[15%] bg-orange-400 w-1.5 h-1.5",
                    "top-4 left-[55%] bg-emerald-400 w-1.5 h-1.5",
                    "top-7 left-[90%] bg-violet-400 w-2 h-2",
                    "top-9 left-[35%] bg-rose-400 w-1.5 h-1.5",
                    "top-11 left-[75%] bg-cyan-400 w-2 h-2",
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-full ${c} opacity-70`}
                    />
                  ))}
                </motion.div>
                <div className="flex flex-col items-center pt-6 sm:pt-8 px-4 text-center">
                  {/* Enhanced checkmark with rings + glow */}
                  <div
                    className="relative mb-5 flex items-center justify-center"
                    style={{ width: 96, height: 96 }}
                  >
                    {/* Glow */}
                    <motion.div
                      style={{ opacity: chkGlow }}
                      className="absolute inset-0 bg-green-400/30 rounded-full blur-2xl scale-150"
                    />
                    {/* Ring 1 */}
                    <motion.div
                      style={{ scale: chkRing1, opacity: chkRing1O }}
                      className="absolute inset-0 rounded-full border-2 border-green-400"
                    />
                    {/* Ring 2 */}
                    <motion.div
                      style={{ scale: chkRing2, opacity: chkRing2O }}
                      className="absolute inset-0 rounded-full border border-green-300"
                    />
                    {/* Check circle */}
                    <motion.div
                      style={{ scale: chkS, rotate: chkR }}
                      className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30"
                    >
                      <motion.div style={{ scale: chkS2 }}>
                        <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-md" />
                      </motion.div>
                    </motion.div>
                  </div>
                  <motion.div
                    style={{ opacity: ord_info, y: ord_infoY }}
                    className="w-full max-w-sm"
                  >
                    <h2 className="font-bold text-gray-900 text-lg sm:text-xl mb-0.5">
                      Order Confirmed!
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                      Order{" "}
                      <span className="font-mono font-semibold text-gray-700">
                        #GZ-20260405-7842
                      </span>
                    </p>
                    {/* Order timeline */}
                    <div className="flex items-center justify-center gap-1 mb-5">
                      {[
                        {
                          icon: ShoppingCart,
                          label: "Ordered",
                          c: "text-green-600 bg-green-100",
                        },
                        {
                          icon: CreditCard,
                          label: "Paid",
                          c: "text-green-600 bg-green-100",
                        },
                        {
                          icon: Package,
                          label: "Preparing",
                          c: "text-green-600 bg-green-100",
                        },
                        {
                          icon: Download,
                          label: "Ready",
                          c: "text-green-600 bg-green-100",
                        },
                      ].map((step, i) => (
                        <motion.div
                          key={i}
                          style={ord_timeline[i]}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`w-8 h-8 rounded-full ${step.c} flex items-center justify-center`}
                          >
                            <step.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[8px] sm:text-[9px] font-medium text-gray-600">
                            {step.label}
                          </span>
                          {i < 3 && <div className="hidden" />}
                        </motion.div>
                      ))}
                    </div>
                    {/* Order details */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-left mb-3">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                            React UI Kit
                          </p>
                          <p className="text-[10px] text-gray-500">
                            by Priya&apos;s Design Studio
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount paid</span>
                          <span className="font-semibold text-gray-800">
                            {"\u20B9"}1,959
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment</span>
                          <span className="text-gray-700">
                            UPI &bull; user@paytm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Coupon</span>
                          <span className="text-green-600 font-medium">
                            WELCOME20 (-{"\u20B9"}400)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">GST Invoice</span>
                          <span className="text-purple-600 font-medium">
                            Download &darr;
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Receipt sent to</span>
                          <span className="text-gray-700">rahul@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* ── 6. DOWNLOAD ── */}
              <motion.div
                style={{ opacity: s6o, y: s6y }}
                className="absolute inset-0 bg-white overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                    Your Files Are Ready
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 mb-5">
                    3 files &bull; 24.8 MB total
                  </p>
                  <div className="w-full max-w-sm space-y-2.5 mb-5">
                    {[
                      {
                        name: "ReactUIKit-v2.4.zip",
                        size: "18.2 MB",
                        icon: HardDrive,
                      },
                      {
                        name: "Documentation.pdf",
                        size: "4.1 MB",
                        icon: FileText,
                      },
                      { name: "Figma-Source.fig", size: "2.5 MB", icon: File },
                    ].map((file, i) => (
                      <motion.div
                        key={i}
                        style={dl_files[i]}
                        className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 p-3 text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <file.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-xs truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {file.size}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-blue-500" />
                      </motion.div>
                    ))}
                  </div>
                  {/* Download progress bar */}
                  <div className="w-full max-w-sm mb-4">
                    <div className="flex items-center justify-between mb-1.5 text-[10px]">
                      <span className="text-gray-500">Downloading...</span>
                      <motion.span className="text-blue-600 font-semibold">
                        {dl_barPercent}
                      </motion.span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        style={{ width: dl_barWidth }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-none"
                      />
                    </div>
                  </div>
                  <motion.div
                    style={{ opacity: dl_done, scale: dl_doneS }}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      All files downloaded successfully!
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              {/* ── 7. REVIEW ── */}
              <motion.div
                style={{ opacity: s7o, y: s7y }}
                className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white overflow-hidden"
              >
                <div className="flex flex-col items-center pt-5 sm:pt-6 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-0.5">
                    How was your purchase?
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 mb-4">
                    Your review helps others decide
                  </p>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 max-w-sm w-full text-left">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                          React UI Kit
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400">
                          Purchased today
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-gray-700 mb-2">
                      Your rating
                    </p>
                    <div className="flex items-center gap-1.5 mb-4">
                      {stars.map((s, i) => (
                        <motion.div key={i} style={{ scale: s }}>
                          <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                        </motion.div>
                      ))}
                      <motion.span
                        style={{ opacity: stars[4] }}
                        className="text-xs text-gray-500 ml-2 font-medium"
                      >
                        5/5
                      </motion.span>
                    </div>
                    <motion.div style={{ opacity: rv_text }}>
                      <p className="text-[11px] font-medium text-gray-700 mb-1.5">
                        Your review
                      </p>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                        <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed">
                          Amazing UI kit! Components are production-ready and
                          saved me weeks. Tailwind integration is seamless.
                          Highly recommended!
                        </p>
                      </div>
                    </motion.div>
                    <motion.div
                      style={{ opacity: rv_btn, scale: rv_btnS }}
                      className="mt-4"
                    >
                      <button className="w-full gradient-primary text-white font-semibold text-xs sm:text-sm h-9 sm:h-10 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                        <ThumbsUp className="w-3.5 h-3.5" /> Submit Review
                      </button>
                    </motion.div>
                  </div>
                  {/* Existing reviews peek */}
                  <motion.div
                    style={{ opacity: rv_btn }}
                    className="max-w-sm w-full mt-4 mb-6"
                  >
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-left">
                      Recent reviews
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          name: "Ankit M.",
                          text: "Clean code, great documentation. Worth every rupee!",
                          r: 5,
                        },
                        {
                          name: "Sneha R.",
                          text: "Saved me so much time on my project. Love it!",
                          r: 5,
                        },
                      ].map((rv, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 rounded-lg border border-gray-100 p-3 text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-800">
                              {rv.name}
                            </span>
                            <div className="flex gap-0.5 ml-auto">
                              {Array.from({ length: rv.r }).map((_, j) => (
                                <Star
                                  key={j}
                                  className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-600 pl-7">
                            {rv.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* ── 8. CLOSING ── */}
              <motion.div
                style={{ opacity: s8o }}
                className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                  <motion.div style={{ scale: s8scale }}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-purple-500/25 mb-5 mx-auto">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-xl sm:text-2xl mb-2">
                      That&apos;s how easy it is!
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 max-w-xs mx-auto mb-6">
                      From browsing to downloading — a seamless experience for
                      every buyer.
                    </p>
                  </motion.div>
                  <motion.div
                    style={{ opacity: s8sparkle }}
                    className="flex items-center gap-6 text-center"
                  >
                    {[
                      { n: "500+", l: "Creators" },
                      { n: "2,000+", l: "Products" },
                      { n: "4.9/5", l: "Rating" },
                    ].map((s, i) => (
                      <div key={i}>
                        <p className="text-lg sm:text-xl font-bold text-primary">
                          {s.n}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
