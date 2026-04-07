"use client"

import { motion } from "framer-motion"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
}

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

export default function TestimonialsSection() {
  return (
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
  )
}
