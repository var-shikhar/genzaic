import type { Transition } from "framer-motion"

export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const

export const SPRING_CARD: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8,
}

export const SPRING_CTA: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 14,
}

export const SPRING_PARALLAX: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 20,
  mass: 0.5,
}

export const DUR_EDITORIAL = 0.7
export const DUR_FADE_REDUCED = 0.2
