import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Icons ─────────────────────────────────────────────────────────────────
// Six inline SVGs in marquee order: eBook, template grid, video, audio
// waveform, design palette, code. Strokes use `currentColor` so the
// surrounding tile colors them via `text-primary`.
const ICONS: Array<(props: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = [
  (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M8 6h8M8 10h8M8 14h5" />
    </svg>
  ),
  (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  ),
  (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      {...p}
    >
      <line x1="4" y1="10" x2="4" y2="14" />
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="16" y1="7" x2="16" y2="17" />
      <line x1="20" y1="10" x2="20" y2="14" />
    </svg>
  ),
  (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2.2-.9 2.2-1.9 0-1-.7-1.4-.7-2.3 0-.8.7-1.6 1.6-1.6H17c2.2 0 4-1.8 4-4A8 8 0 0 0 12 3z" />
      <circle cx="7" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="11" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  (p) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polyline points="8,7 3,12 8,17" />
      <polyline points="16,7 21,12 16,17" />
      <line x1="14" y1="5" x2="10" y2="19" />
    </svg>
  ),
]

// Negative animation-delays so the inline carousel staggers across the cycle.
// 6 icons × 1.5s stagger = 9s total cycle.
const TILE_DELAYS = [
  "[animation-delay:0s]",
  "[animation-delay:-1.5s]",
  "[animation-delay:-3s]",
  "[animation-delay:-4.5s]",
  "[animation-delay:-6s]",
  "[animation-delay:-7.5s]",
] as const

const INLINE_STAGE_MASK =
  "[mask-image:linear-gradient(90deg,transparent_0%,black_18%,black_82%,transparent_100%)] " +
  "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_18%,black_82%,transparent_100%)]"

const BELT_STAGE_MASK =
  "[mask-image:linear-gradient(90deg,transparent_0%,black_16%,black_84%,transparent_100%)] " +
  "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_16%,black_84%,transparent_100%)]"

interface GenzaicLoaderProps {
  /** Mono-uppercase caption shown beneath the wordmark. */
  label?: string
  /** Override the wordmark text. Defaults to "GenZaic". */
  brand?: string
  className?: string
}

/**
 * Block-level loader. Centers itself within its parent.
 * Composition: marquee icon belt → wordmark with sweeping beam → bar → caption.
 */
function GenzaicLoaderRoot({
  label = "Loading",
  brand = "GenZaic",
  className,
}: GenzaicLoaderProps) {
  // Two copies of the 6-icon set so the marquee can loop seamlessly.
  const beltIcons = React.useMemo(() => [...ICONS, ...ICONS], [])

  return (
    <div
      className={cn("relative flex flex-col items-center gap-[18px]", className)}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>

      {/* Marquee belt — 280×80 stage, edges fade via mask. */}
      <div
        aria-hidden="true"
        className={cn(
          "relative overflow-hidden w-[280px] h-20",
          BELT_STAGE_MASK,
        )}
      >
        <div className="absolute top-1/2 left-0 flex gap-[18px] pl-[18px] genzaic-belt animate-genzaic-belt will-change-transform">
          {beltIcons.map((Icon, i) => (
            <span
              key={i}
              className={cn(
                "flex-none w-[60px] h-[60px] rounded-[14px] grid place-items-center",
                "border border-primary/20 text-primary",
                "bg-gradient-to-b from-background to-primary/10",
                "shadow-[0_6px_18px_hsl(var(--primary)/0.10)]",
                "dark:shadow-[0_8px_22px_hsl(var(--primary)/0.28)]",
                "dark:border-primary/40",
              )}
            >
              <Icon className="w-[26px] h-[26px]" />
            </span>
          ))}
        </div>
      </div>

      {/* Wordmark zone — beam scans across this row only. */}
      <div className="relative w-[280px] flex items-center justify-center py-2">
        {/* Beam layer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span
            className={cn(
              "absolute top-1/2 left-0 h-12 w-[140px] rounded-full blur-[12px]",
              "bg-gradient-to-r from-transparent via-primary/55 to-transparent",
              "mix-blend-multiply dark:mix-blend-plus-lighter",
              "animate-genzaic-beam-sweep genzaic-beam",
            )}
          />
          <span
            className={cn(
              "absolute top-1/2 left-[20%] h-px w-[60%]",
              "bg-gradient-to-r from-transparent via-primary to-transparent",
              "animate-genzaic-beam-line genzaic-beam-line",
            )}
          />
        </span>

        <div className="relative z-10 inline-flex items-center gap-2.5 font-display font-semibold text-[22px] tracking-[-0.01em]">
          <span>{brand}</span>
          <span
            className={cn(
              "inline-block w-[7px] h-[7px] rounded-full bg-primary",
              "animate-genzaic-dot genzaic-dot",
            )}
          />
        </div>
      </div>

      {/* Sliding underline bar */}
      <div
        className={cn(
          "w-[90px] h-[2px] rounded-[2px] [background-size:220%_100%]",
          "bg-[linear-gradient(90deg,transparent,hsl(var(--primary)),transparent)]",
          "animate-genzaic-bar genzaic-bar",
        )}
      />

      {/* Caption */}
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
        — {label} —
      </div>
    </div>
  )
}

/**
 * Inline pill — small carousel + caption. For buttons, list rows, modals.
 * Unchanged from the previous implementation.
 */
function GenzaicLoaderInline({
  label = "Loading",
  className,
}: GenzaicLoaderProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-border bg-background",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className={cn("relative w-[110px] h-8", INLINE_STAGE_MASK)}
      >
        <span
          className={cn(
            "absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-[10px] pointer-events-none",
            "bg-[radial-gradient(closest-side,hsl(var(--primary)/0.16),transparent_75%)]",
            "animate-genzaic-halo",
          )}
        />
        {ICONS.map((Icon, i) => (
          <span
            key={i}
            className={cn(
              "absolute top-1/2 left-1/2 -mt-[13px] -ml-[13px] w-[26px] h-[26px]",
              "rounded-[7px] grid place-items-center",
              "bg-gradient-to-b from-background to-primary/10",
              "border border-primary/20 text-primary",
              "translate-x-[56px] scale-[0.75] opacity-0",
              "animate-genzaic-carousel-sm genzaic-tile",
              i === 2 && "genzaic-tile--reduced-fallback",
              TILE_DELAYS[i],
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
        ))}
      </div>
      <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
        — {label} —
      </span>
    </div>
  )
}

/**
 * Subtle shadcn-style grid backdrop. Two layered linear-gradients form 32×32
 * grid cells in `currentColor`; a radial mask hollows out the center so the
 * loader sits on a clean stage and the grid only reads at the edges.
 */
function GenzaicGridBackdrop({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0",
        "[background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)]",
        "[background-size:32px_32px]",
        "opacity-[0.035] dark:opacity-[0.06]",
        "[mask-image:radial-gradient(ellipse_70%_60%_at_center,transparent_0%,rgba(0,0,0,0.45)_35%,black_70%)]",
        "[-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_center,transparent_0%,rgba(0,0,0,0.45)_35%,black_70%)]",
        className,
      )}
    />
  )
}

/**
 * Full-bleed in-pane loader. Fills its parent column with the brand
 * background, dropped-out grid backdrop, and the root loader centered.
 */
function GenzaicLoaderPage({
  label = "Loading",
  brand,
  className,
}: GenzaicLoaderProps) {
  return (
    <div
      className={cn(
        "relative min-h-[60vh] w-full grid place-items-center bg-background overflow-hidden",
        className,
      )}
    >
      <GenzaicGridBackdrop />
      <div className="relative z-10">
        <GenzaicLoaderRoot label={label} brand={brand} />
      </div>
    </div>
  )
}

type GenzaicLoaderType = typeof GenzaicLoaderRoot & {
  Inline: typeof GenzaicLoaderInline
  Page: typeof GenzaicLoaderPage
  GridBackdrop: typeof GenzaicGridBackdrop
}

const GenzaicLoader = GenzaicLoaderRoot as GenzaicLoaderType
GenzaicLoader.Inline = GenzaicLoaderInline
GenzaicLoader.Page = GenzaicLoaderPage
GenzaicLoader.GridBackdrop = GenzaicGridBackdrop

export { GenzaicLoader }
export type { GenzaicLoaderProps }
