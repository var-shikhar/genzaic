"use client"

import { motion, useReducedMotion } from "framer-motion"

interface ClosedStoreBackdropProps {
  /** The seller's primary color — drives the tint of every animated layer. */
  primaryColor: string
}

/**
 * Calm ambient backdrop for the public closed-store page.
 *
 * Three large soft-gradient orbs drift slowly across the viewport on long,
 * out-of-phase loops. A single faint beam sweeps diagonally over ~40s,
 * just enough to make the page feel "alive" without competing with the
 * "we'll be right back" message. A handful of tiny floating particles add
 * texture without ever drawing the eye.
 *
 * All motion is transform/opacity-only and runs at well under 60fps cost
 * even with three blurred orbs in play. Honors `prefers-reduced-motion`
 * with a static still of the same composition.
 */
export function ClosedStoreBackdrop({ primaryColor }: ClosedStoreBackdropProps) {
  const reduced = useReducedMotion()

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {/* ── Orb 1 — primary accent, large, top-left ──────────────────────── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          top: "-25%",
          left: "-20%",
          background: `radial-gradient(circle, ${primaryColor}55 0%, ${primaryColor}22 35%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, 40, -10, 20, 0],
                y: [0, 20, -15, 10, 0],
                scale: [1, 1.06, 0.98, 1.04, 1],
              }
        }
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── Orb 2 — cool counter-light, bottom-right ─────────────────────── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "55vw",
          height: "55vw",
          bottom: "-20%",
          right: "-15%",
          background:
            "radial-gradient(circle, rgba(120,170,255,0.30) 0%, rgba(120,170,255,0.10) 40%, transparent 75%)",
          filter: "blur(85px)",
        }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, -30, 10, -15, 0],
                y: [0, -20, 5, -10, 0],
                scale: [1, 1.04, 0.97, 1.05, 1],
              }
        }
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      />

      {/* ── Orb 3 — small floating accent, mid-canvas ────────────────────── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "35vw",
          height: "35vw",
          top: "30%",
          left: "30%",
          background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
        animate={
          reduced
            ? undefined
            : {
                x: [0, 25, -25, 0],
                y: [0, -15, 15, 0],
                opacity: [0.5, 0.85, 0.5, 0.85, 0.5],
              }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* ── Soft diagonal beam ───────────────────────────────────────────── */}
      {/* One very wide, very faint strip slowly drifting across. 40s is
          deliberately glacial — it's there to make you notice motion
          subconsciously, not to draw the eye. */}
      <motion.div
        className="absolute h-[200vh] -top-1/2"
        style={{
          width: "30vw",
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)`,
          filter: "blur(20px)",
          transform: "rotate(20deg)",
          transformOrigin: "center",
        }}
        animate={reduced ? undefined : { x: ["-40vw", "140vw"] }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* ── Floating particles ───────────────────────────────────────────── */}
      {/* A handful of tiny soft-glowing dots that gently rise. Numerous
          enough to feel atmospheric, sparse enough that none ever feel
          like they're "pointing" at something. */}
      {Array.from({ length: 8 }).map((_, i) => {
        const left = (i * 13 + 7) % 100 // pseudo-random spread
        const size = 1.5 + (i % 3) * 0.5
        const duration = 18 + (i % 4) * 4
        const delay = i * 1.4
        return (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              bottom: "-2%",
              background: i % 2 === 0 ? primaryColor : "#ffffff",
              boxShadow: `0 0 ${size * 4}px ${
                i % 2 === 0 ? primaryColor : "rgba(255,255,255,0.6)"
              }`,
              opacity: 0,
            }}
            animate={
              reduced
                ? undefined
                : {
                    y: ["0vh", "-110vh"],
                    opacity: [0, 0.6, 0.6, 0],
                    x: [0, i % 2 === 0 ? 30 : -30, 0],
                  }
            }
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
              delay,
              times: [0, 0.1, 0.85, 1],
            }}
          />
        )
      })}

      {/* ── Vignette ─────────────────────────────────────────────────────── */}
      {/* Soft darkening at the edges to focus attention on the center
          message. Static — doesn't compete with the animated layers. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* ── Film grain ───────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>")`,
        }}
      />
    </div>
  )
}
