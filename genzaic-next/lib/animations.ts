import type { Variants, Transition } from "framer-motion"

/**
 * Shared Framer Motion variants used across landing/marketing pages and
 * dashboard cards. Centralized so the timing and easing stay consistent.
 *
 * Convention: every variant exposes `initial` + `animate`. Use `whileInView`
 * with `viewport={{ once: true }}` for scroll-triggered reveals.
 */

const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1]

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: easeOut } },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOut } },
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
}

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
}

/**
 * Stagger container — apply to a parent and use any of the *Item* variants
 * (or any variant above) on its children. Children animate in sequence with
 * a 0.08s delta by default.
 */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
})

/** Smaller, snappier item for stagger lists (cards, nav links). */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
}

/** Used for hero headlines and big page openings. */
export const hero: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
}
