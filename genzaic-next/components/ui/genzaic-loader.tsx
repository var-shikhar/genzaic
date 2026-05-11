import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Icons ─────────────────────────────────────────────────────────────────
// Six inline SVGs in carousel order: eBook, template grid, video, audio
// waveform, design palette, code. All strokes use `currentColor` so the
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

// Negative animation-delays so the icons stagger across the cycle.
// 6 icons × 1.5s stagger = 9s total cycle.
const TILE_DELAYS = [
  "[animation-delay:0s]",
  "[animation-delay:-1.5s]",
  "[animation-delay:-3s]",
  "[animation-delay:-4.5s]",
  "[animation-delay:-6s]",
  "[animation-delay:-7.5s]",
] as const

const STAGE_MASK =
  "[mask-image:linear-gradient(90deg,transparent_0%,black_14%,black_86%,transparent_100%)] " +
  "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_14%,black_86%,transparent_100%)]"

const INLINE_STAGE_MASK =
  "[mask-image:linear-gradient(90deg,transparent_0%,black_18%,black_82%,transparent_100%)] " +
  "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_18%,black_82%,transparent_100%)]"

interface GenzaicLoaderProps {
  /** Mono-uppercase caption shown beneath the wordmark. */
  label?: string
  /** Override the wordmark text. Defaults to "GenZaic". */
  brand?: string
  className?: string
}

/**
 * Default block-level loader. Centers itself within its parent.
 */
function GenzaicLoaderRoot({
  label = "Loading the marketplace",
  brand = "GenZaic",
  className,
}: GenzaicLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-[22px]",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>

      {/* Stage: 260×96, halo at center, 6 sliding tiles */}
      <div
        aria-hidden="true"
        className={cn(
          "relative w-[260px] h-24 grid place-items-center",
          STAGE_MASK,
        )}
      >
        {/* Anchor halo */}
        <span
          className={cn(
            "absolute w-24 h-24 rounded-3xl pointer-events-none",
            "bg-[radial-gradient(closest-side,hsl(var(--primary)/0.18),transparent_70%)]",
            "animate-genzaic-halo",
            "genzaic-halo",
          )}
        />

        {/* Sliding tiles */}
        {ICONS.map((Icon, i) => (
          <span
            key={i}
            className={cn(
              "absolute top-1/2 left-1/2 -mt-9 -ml-9 w-[72px] h-[72px]",
              "rounded-2xl grid place-items-center",
              "bg-gradient-to-b from-white to-[hsl(var(--primary)/0.10)]",
              "border border-[hsl(var(--primary)/0.20)]",
              "shadow-[0_8px_24px_hsl(var(--primary)/0.10)]",
              // Static initial state matches 0% keyframe — no first-frame stacking flash.
              "translate-x-[144px] scale-[0.72] opacity-0",
              "animate-genzaic-carousel genzaic-tile",
              i === 2 && "genzaic-tile--reduced-fallback",
              TILE_DELAYS[i],
            )}
          >
            <Icon className="w-8 h-8 text-primary" />
          </span>
        ))}
      </div>

      {/* Wordmark + dot */}
      <div className="font-display font-semibold text-[22px] tracking-[-0.01em] flex items-center gap-2.5">
        <span>{brand}</span>
        <span
          className={cn(
            "inline-block w-[7px] h-[7px] rounded-full bg-primary",
            "animate-genzaic-dot genzaic-dot",
          )}
        />
      </div>

      {/* Sliding underline bar */}
      <div
        className={cn(
          "w-[84px] h-[2px] rounded-[2px] [background-size:220%_100%]",
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
 */
function GenzaicLoaderInline({
  label = "Loading the marketplace",
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
        className={cn(
          "relative w-[110px] h-8",
          INLINE_STAGE_MASK,
        )}
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
              "bg-gradient-to-b from-white to-[hsl(var(--primary)/0.10)]",
              "border border-[hsl(var(--primary)/0.22)]",
              "translate-x-[56px] scale-[0.75] opacity-0",
              "animate-genzaic-carousel-sm genzaic-tile",
              i === 2 && "genzaic-tile--reduced-fallback",
              TILE_DELAYS[i],
            )}
          >
            <Icon className="w-3.5 h-3.5 text-primary" />
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
 * Full-screen overlay. Fills the viewport, uses the same default loader
 * centered against the page background.
 */
function GenzaicLoaderPage({
  label = "Loading the marketplace",
  brand,
  className,
}: GenzaicLoaderProps) {
  return (
    <div
      className={cn(
        "min-h-[60vh] w-full grid place-items-center bg-background",
        className,
      )}
    >
      <GenzaicLoaderRoot label={label} brand={brand} />
    </div>
  )
}

type GenzaicLoaderType = typeof GenzaicLoaderRoot & {
  Inline: typeof GenzaicLoaderInline
  Page: typeof GenzaicLoaderPage
}

const GenzaicLoader = GenzaicLoaderRoot as GenzaicLoaderType
GenzaicLoader.Inline = GenzaicLoaderInline
GenzaicLoader.Page = GenzaicLoaderPage

export { GenzaicLoader }
export type { GenzaicLoaderProps }
