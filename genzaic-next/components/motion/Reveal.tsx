"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import type { ReactNode } from "react"
import { getVariants, type RevealFrom } from "@/lib/motion/variants"
import { useReducedMotion } from "@/lib/motion/useReducedMotion"

type RevealProps = {
  children: ReactNode
  from?: RevealFrom
  delay?: number
  once?: boolean
  margin?: string
  className?: string
} & Omit<
  HTMLMotionProps<"div">,
  "variants" | "initial" | "whileInView" | "viewport" | "custom"
>

export function Reveal({
  children,
  from = "up",
  delay = 0,
  once = true,
  margin = "-80px",
  className,
  ...rest
}: RevealProps) {
  const isReduced = useReducedMotion()
  const variants = getVariants(from, isReduced)

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: margin as `${number}px` }}
      custom={delay}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
