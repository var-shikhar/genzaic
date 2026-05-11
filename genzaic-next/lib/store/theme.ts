// Single source of truth for storefront theming. Both the editor's preview
// (StorefrontPreview) and the public storefront page (app/store/[storeUrl])
// must derive their look from this same mapping — otherwise picking a theme
// in the editor produces one preview but a different public render.

// The editor saves the seller's choice in `imprintCoverPreset` /
// `imprintTypePairing` (the imprint enum columns). The legacy `themeId` and
// `fontFamily` columns are never written by the imprint editor, so the public
// page MUST derive its look from the imprint columns — not from `themeId` /
// `fontFamily` directly.
export type CoverPreset =
  | "ink"
  | "sunlit"
  | "stamp"
  | "studio"
  | "archive"
  | "riso"
  | "mono"
  | "sage"
  | "linen"
  | "noir"
export type TypePairing = "house" | "press" | "studio" | "plain"

export function presetToThemeId(preset: string | null | undefined): string {
  switch (preset) {
    case "ink":
      return "dark"
    case "sunlit":
      return "playful"
    case "stamp":
      return "elegant"
    case "studio":
      return "modern"
    case "archive":
      return "modern"
    case "riso":
      return "bold"
    case "mono":
      return "editorial"
    case "sage":
      return "garden"
    case "linen":
      return "paper"
    case "noir":
      return "noir"
    default:
      return "modern"
  }
}

const PAIRING_DISPLAY_VAR: Record<string, string> = {
  house: "var(--font-display)",
  press: "var(--font-press-display)",
  studio: "var(--font-studio-display)",
  plain: "var(--font-plain-display)",
}

export function pairingDisplayFont(pairing: string | null | undefined): string {
  return PAIRING_DISPLAY_VAR[pairing ?? "house"] ?? PAIRING_DISPLAY_VAR.house
}

export const PAIRING_BODY_STACK = "var(--font-body), system-ui, sans-serif"

export interface ThemeStyle {
  pageBg: string
  coverGradient: (color: string) => string
  hero: string
  heroText: string
  subText: string
  productCard: string
  productCardText: string
  productPrice: string
  fontWeightHeading: string
  cornerRadius: string
}

export function themeFor(themeId: string, _primary: string): ThemeStyle {
  switch (themeId) {
    case "bold":
      return {
        pageBg: "bg-zinc-900",
        coverGradient: (c) => `linear-gradient(135deg, ${c}, #000)`,
        hero: "py-8",
        heroText: "text-white tracking-tight",
        subText: "text-zinc-300",
        productCard: "bg-zinc-800 border-zinc-700",
        productCardText: "text-white",
        productPrice: "text-white font-extrabold",
        fontWeightHeading: "font-extrabold uppercase",
        cornerRadius: "rounded-sm",
      }
    case "elegant":
      return {
        pageBg: "bg-rose-50/40",
        coverGradient: () => `linear-gradient(135deg, #fbcfe8, #f9a8d4 60%, #fce7f3)`,
        hero: "py-6",
        heroText: "text-rose-950 italic",
        subText: "text-rose-700/80",
        productCard: "bg-white border-rose-200/60 shadow-sm",
        productCardText: "text-rose-950",
        productPrice: "text-rose-700",
        fontWeightHeading: "font-light tracking-wide",
        cornerRadius: "rounded-2xl",
      }
    case "playful":
      return {
        pageBg: "bg-yellow-50",
        coverGradient: () => `linear-gradient(135deg, #fbbf24, #f97316 80%)`,
        hero: "py-6",
        heroText: "text-orange-950",
        subText: "text-orange-900/80",
        productCard: "bg-white border-orange-300/60",
        productCardText: "text-orange-950",
        productPrice: "text-orange-700 font-bold",
        fontWeightHeading: "font-bold",
        cornerRadius: "rounded-3xl",
      }
    case "dark":
      return {
        pageBg: "bg-black",
        coverGradient: (c) => `linear-gradient(135deg, ${c}, #18181b 60%, #000)`,
        hero: "py-6",
        heroText: "text-zinc-50",
        subText: "text-zinc-400",
        productCard: "bg-zinc-900 border-zinc-800",
        productCardText: "text-zinc-100",
        productPrice: "text-emerald-400 font-bold",
        fontWeightHeading: "font-semibold",
        cornerRadius: "rounded-md",
      }
    case "minimal":
      return {
        pageBg: "bg-slate-50",
        coverGradient: (c) => `linear-gradient(135deg, ${c}, ${c}aa)`,
        hero: "py-6",
        heroText: "text-slate-900",
        subText: "text-slate-600",
        productCard: "bg-white border-slate-200",
        productCardText: "text-slate-900",
        productPrice: "text-slate-900 font-semibold",
        fontWeightHeading: "font-semibold",
        cornerRadius: "rounded-xl",
      }
    case "editorial":
      // Mono — newspaper / Sunday-section vibe. Off-white page, sharp corners,
      // tight bold heading, and a top-rule that runs across each card like a
      // section header. Cover layers vertical column rules over a stone wash
      // for that printed-page feel; the accent only tinges the rule color so
      // the layout stays editorial regardless of swatch.
      return {
        pageBg: "bg-stone-50",
        coverGradient: (c) =>
          `repeating-linear-gradient(90deg, transparent 0 96px, ${c}26 96px 97px), linear-gradient(180deg, #FAFAF9 0%, #E7E5E4 100%)`,
        hero: "py-7",
        heroText: "text-stone-900 tracking-[-0.025em]",
        subText: "text-stone-700",
        productCard:
          "bg-white border-stone-200 border-t-2 border-t-stone-900",
        productCardText: "text-stone-900",
        productPrice: "text-stone-900 font-semibold tracking-tight",
        fontWeightHeading: "font-bold tracking-[-0.025em]",
        cornerRadius: "rounded-none",
      }
    case "garden":
      // Sage — botanical / wellness. Conic-gradient cover for an organic,
      // light-through-leaves feel + a soft top-left highlight. Cards float
      // with a frosted backdrop and a deep-green halo shadow. Generous
      // corner radius for that calm, breathable mood.
      return {
        pageBg: "bg-emerald-50/60",
        coverGradient: (c) =>
          `radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.55) 0%, transparent 50%), conic-gradient(from 200deg at 70% 70%, #D1FAE5, #A7F3D0, #34D399, ${c}, #6EE7B7, #D1FAE5)`,
        hero: "py-7",
        heroText: "text-emerald-950 tracking-tight",
        subText: "text-emerald-900/75",
        productCard:
          "bg-white/80 backdrop-blur-sm border-emerald-200/40 shadow-[0_4px_24px_-12px_rgba(6,78,59,0.30)]",
        productCardText: "text-emerald-950",
        productPrice: "text-emerald-800 font-medium",
        fontWeightHeading: "font-medium tracking-tight",
        cornerRadius: "rounded-3xl",
      }
    case "paper":
      // Linen — handmade journal. Warm cream page, dappled radial gradients
      // on the cover for a paper-pulp texture, and a chunky offset shadow on
      // cards (like stacked sheets). Italic heading completes the
      // hand-bound-notebook voice.
      return {
        pageBg: "bg-[#FBF7EE]",
        coverGradient: (c) =>
          `radial-gradient(ellipse at 25% 30%, rgba(254,243,199,0.85) 0%, transparent 50%), radial-gradient(ellipse at 78% 65%, ${c}40 0%, transparent 55%), linear-gradient(135deg, #FFFBEB 0%, #FDE68A 60%, ${c}99 100%)`,
        hero: "py-6",
        heroText: "text-amber-950 italic tracking-tight",
        subText: "text-amber-900/75 italic",
        productCard:
          "bg-amber-50 border-amber-300/70 shadow-[3px_3px_0_0_rgba(146,64,14,0.10)]",
        productCardText: "text-amber-950",
        productPrice: "text-amber-900 font-medium",
        fontWeightHeading: "font-medium italic tracking-tight",
        cornerRadius: "rounded-2xl",
      }
    case "noir":
      // Premium / fashion-house. True deep black with a single soft spotlight
      // wash from the top so the seller's accent acts like stage lighting.
      // Cards are visibly lifted (`bg-neutral-900` over `bg-neutral-950`) plus
      // a defined `neutral-700` border and an inner top-highlight for that
      // glassy, fashion-editorial card feel. Heading is light + tight
      // letter-spacing — the COS / Margiela move, not the bold-luxury cliche.
      return {
        pageBg: "bg-neutral-950",
        coverGradient: (c) =>
          `radial-gradient(ellipse at 50% 0%, ${c}55 0%, transparent 60%), linear-gradient(180deg, #1A1A1A 0%, #000000 100%)`,
        hero: "py-9",
        heroText: "text-neutral-50 tracking-[-0.02em]",
        subText: "text-neutral-400",
        productCard:
          "bg-neutral-900 border-neutral-700 ring-1 ring-white/[0.04]",
        productCardText: "text-neutral-100",
        productPrice: "text-neutral-50 font-light tracking-[0.04em]",
        fontWeightHeading: "font-light tracking-[-0.02em]",
        cornerRadius: "rounded-none",
      }
    case "modern":
    default:
      return {
        pageBg: "bg-background",
        coverGradient: (c) => `linear-gradient(135deg, ${c}, ${c}cc)`,
        hero: "py-6",
        heroText: "text-foreground",
        subText: "text-muted-foreground",
        productCard: "bg-card border-border",
        productCardText: "text-foreground",
        productPrice: "text-foreground font-semibold",
        fontWeightHeading: "font-semibold",
        cornerRadius: "rounded-xl",
      }
  }
}
