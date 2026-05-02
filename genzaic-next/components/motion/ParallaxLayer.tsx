"use client"

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion"
import { useRef, type ReactNode } from "react"
import { useReducedMotion } from "@/lib/motion/useReducedMotion"
import { SPRING_PARALLAX } from "@/lib/motion/easings"

type ParallaxLayerProps = {
  children?: ReactNode
  speed?: number
  scaleRange?: [number, number]
  fadeOut?: boolean
  className?: string
}

export function ParallaxLayer({
  children,
  speed = 0,
  scaleRange,
  fadeOut = false,
  className,
}: ParallaxLayerProps) {
  const isReduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const smooth = useSpring(scrollYProgress, SPRING_PARALLAX)

  const yRange: [number, number] = [-speed * 200, speed * 200]
  const yRaw = useTransform(smooth, [0, 1], yRange)
  const scaleRaw = useTransform(
    smooth,
    [0, 1],
    scaleRange ?? [1, 1],
  ) as MotionValue<number>
  const opacityRaw = useTransform(smooth, [0.7, 1], [1, 0])

  if (isReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: speed === 0 ? undefined : yRaw,
        scale: scaleRange ? scaleRaw : undefined,
        opacity: fadeOut ? opacityRaw : undefined,
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  )
}
