"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type SlugStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"

interface SlugStatusBadgeProps {
  status: SlugStatus
}

/**
 * Inline status row that sits below the store-URL slug input. Replaces a
 * static "— Available" line with a small icon + label that animates in
 * whenever the live availability check resolves.
 *
 * Animation breakdown:
 *  - The whole row fades + lifts on enter and exit via AnimatePresence,
 *    so transitions between states (checking → available, etc.) feel
 *    continuous instead of popping.
 *  - The "available" checkmark is drawn in by animating SVG `pathLength`
 *    after the disc has scaled in — gives the satisfying "stamp" feel of
 *    a slot landing.
 *  - The "checking" pulse and the "taken" shake use cheap CSS-y motion
 *    keyed off framer's transition props so we don't pull in extra deps.
 */
export function SlugStatusBadge({ status }: SlugStatusBadgeProps) {
  return (
    <div className="h-4 mt-1 overflow-visible">
      <AnimatePresence mode="wait" initial={false}>
        {status !== "idle" && (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: -3, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 30,
              mass: 0.6,
            }}
            className="inline-flex items-center gap-1.5"
          >
            {status === "checking" && <CheckingDots />}
            {status === "available" && <AvailableMark />}
            {status === "taken" && <TakenMark />}
            {status === "invalid" && <InvalidMark />}

            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.12em]",
                status === "checking" && "text-muted-foreground",
                status === "available" &&
                  "text-emerald-600 dark:text-emerald-400",
                status === "taken" && "text-flicker",
                status === "invalid" && "text-flicker",
              )}
            >
              {status === "checking" && "Checking…"}
              {status === "available" && "Available"}
              {status === "taken" && "Taken, try another"}
              {status === "invalid" &&
                "Lowercase letters, numbers, hyphens only"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function AvailableMark() {
  return (
    <motion.svg
      viewBox="0 0 16 16"
      width={14}
      height={14}
      initial={false}
      className="shrink-0"
      aria-hidden
    >
      {/* The disc scales in first — gives the checkmark something to land
          on rather than appearing in empty space. */}
      <motion.circle
        cx="8"
        cy="8"
        r="7.2"
        fill="currentColor"
        className="text-emerald-500/15"
        stroke="currentColor"
        strokeWidth="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ originX: "8px", originY: "8px" }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 26,
          mass: 0.5,
        }}
      />
      {/* The check itself draws in via pathLength after the disc lands. */}
      <motion.path
        d="M4.6 8.3 L7 10.7 L11.4 5.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-600 dark:text-emerald-400"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 0.32,
          delay: 0.12,
          ease: [0.65, 0, 0.35, 1],
        }}
      />
    </motion.svg>
  )
}

function TakenMark() {
  return (
    <motion.svg
      viewBox="0 0 16 16"
      width={14}
      height={14}
      className="shrink-0 text-flicker"
      aria-hidden
      // Subtle one-shake to flag the rejection — quick lateral wobble,
      // less aggressive than a full shake-loop.
      animate={{ x: [0, -2, 2, -1, 1, 0] }}
      transition={{ duration: 0.36, ease: "easeOut" }}
    >
      <circle
        cx="8"
        cy="8"
        r="7.2"
        fill="currentColor"
        className="text-flicker/15"
      />
      <motion.path
        d="M5.2 5.2 L10.8 10.8 M10.8 5.2 L5.2 10.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.28, delay: 0.05, ease: "easeOut" }}
      />
    </motion.svg>
  )
}

function InvalidMark() {
  return (
    <motion.svg
      viewBox="0 0 16 16"
      width={14}
      height={14}
      className="shrink-0 text-flicker"
      aria-hidden
    >
      <motion.path
        d="M8 1.5 L15 13.5 L1 13.5 Z"
        fill="currentColor"
        className="text-flicker/15"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ originX: "8px", originY: "9.5px" }}
        transition={{
          type: "spring",
          stiffness: 580,
          damping: 24,
        }}
      />
      <motion.line
        x1="8"
        y1="6"
        x2="8"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.18, delay: 0.1 }}
      />
      <motion.circle
        cx="8"
        cy="12"
        r="0.9"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{ originX: "8px", originY: "12px" }}
        transition={{ delay: 0.22, type: "spring", stiffness: 600 }}
      />
    </motion.svg>
  )
}

function CheckingDots() {
  // Three dots that gently pulse out of phase. Reads as "working" without
  // grabbing the eye like a spinner would in a busy form section.
  const dotTransition = {
    duration: 0.9,
    repeat: Infinity,
    ease: "easeInOut" as const,
  }
  return (
    <span
      className="inline-flex items-center gap-0.5 text-muted-foreground"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1 h-1 rounded-full bg-current"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -1.5, 0] }}
          transition={{ ...dotTransition, delay: i * 0.14 }}
        />
      ))}
    </span>
  )
}
