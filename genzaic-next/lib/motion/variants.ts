import type { Variants } from "framer-motion"
import {
  EASE_EDITORIAL,
  DUR_EDITORIAL,
  DUR_FADE_REDUCED,
  SPRING_CARD,
  SPRING_CTA,
} from "./easings"

export type RevealFrom =
  | "fade-scale"
  | "left"
  | "right"
  | "up"
  | "down"
  | "up-spring"
  | "card"

const REDUCED: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: DUR_FADE_REDUCED, ease: "linear", delay },
  }),
}

export function getVariants(from: RevealFrom, isReduced: boolean): Variants {
  if (isReduced) return REDUCED

  switch (from) {
    case "fade-scale":
      return {
        hidden: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
        visible: (delay: number = 0) => ({
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: DUR_EDITORIAL, ease: EASE_EDITORIAL, delay },
        }),
      }
    case "left":
      return {
        hidden: { opacity: 0, x: -40 },
        visible: (delay: number = 0) => ({
          opacity: 1,
          x: 0,
          transition: { duration: 0.75, ease: EASE_EDITORIAL, delay },
        }),
      }
    case "right":
      return {
        hidden: { opacity: 0, x: 40 },
        visible: (delay: number = 0) => ({
          opacity: 1,
          x: 0,
          transition: { duration: 0.75, ease: EASE_EDITORIAL, delay },
        }),
      }
    case "up":
      return {
        hidden: { opacity: 0, y: 32 },
        visible: (delay: number = 0) => ({
          opacity: 1,
          y: 0,
          transition: { duration: DUR_EDITORIAL, ease: EASE_EDITORIAL, delay },
        }),
      }
    case "down":
      return {
        hidden: { opacity: 0, y: -24 },
        visible: (delay: number = 0) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: EASE_EDITORIAL, delay },
        }),
      }
    case "up-spring":
      return {
        hidden: { opacity: 0, y: 24 },
        visible: (delay: number = 0) => ({
          opacity: 1,
          y: 0,
          transition: { ...SPRING_CTA, delay },
        }),
      }
    case "card":
      return {
        hidden: { opacity: 0, y: 30, scale: 0.97 },
        visible: (delay: number = 0) => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { ...SPRING_CARD, delay },
        }),
      }
  }
}
