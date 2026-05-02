"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { Children, type ReactNode } from "react"
import { getVariants, type RevealFrom } from "@/lib/motion/variants"
import { useReducedMotion } from "@/lib/motion/useReducedMotion"

type Pattern = "stagger" | "fan" | "cascade"

type RevealGroupProps = {
  children: ReactNode
  pattern?: Pattern
  stagger?: number
  once?: boolean
  margin?: string
  className?: string
} & Omit<
  HTMLMotionProps<"div">,
  "variants" | "initial" | "whileInView" | "viewport"
>

const DEFAULT_STAGGER: Record<Pattern, number> = {
  stagger: 0.08,
  fan: 0.08,
  cascade: 0.1,
}

function resolveChildFrom(
  pattern: Pattern,
  index: number,
  total: number,
): RevealFrom {
  if (pattern === "stagger" || pattern === "cascade") return "up"
  if (total <= 1) return "card"
  const third = total / 3
  if (index < third) return "left"
  if (index >= total - third) return "right"
  return "card"
}

export function RevealGroup({
  children,
  pattern = "stagger",
  stagger,
  once = true,
  margin = "-60px",
  className,
  ...rest
}: RevealGroupProps) {
  const isReduced = useReducedMotion()
  const items = Children.toArray(children)
  const total = items.length
  const step = isReduced ? 0 : (stagger ?? DEFAULT_STAGGER[pattern])

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: margin as `${number}px` }}
      className={className}
      {...rest}
    >
      {items.map((child, i) => {
        const from = resolveChildFrom(pattern, i, total)
        const variants = getVariants(from, isReduced)
        return (
          <motion.div key={i} variants={variants} custom={i * step}>
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
