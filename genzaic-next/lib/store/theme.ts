// Single source of truth for storefront theming. Both the editor's preview
// (StorefrontPreview) and the public storefront page (app/store/[storeUrl])
// must derive their look from this same mapping — otherwise picking a theme
// in the editor produces one preview but a different public render.

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
