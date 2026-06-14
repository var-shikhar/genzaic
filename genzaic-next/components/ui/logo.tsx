import Image from "next/image"
import { cn } from "@/lib/utils"
// logo-light = light-coloured mark → reads well on DARK backgrounds
// logo-dark  = dark-coloured mark  → reads well on LIGHT backgrounds
import logoLight from "@/public/logo-light.png"
import logoDark from "@/public/logo-dark.png"

type LogoProps = {
  width?: number
  height?: number
  className?: string
  /**
   * Which background the logo sits on.
   * - "auto"    → follow the active theme (dark theme = light logo, light theme = dark logo)
   * - "onDark"  → force the light logo (surfaces that are dark regardless of theme: hero, footer, auth panel)
   * - "onLight" → force the dark logo (surfaces that are light regardless of theme)
   */
  surface?: "auto" | "onDark" | "onLight"
}

export function Logo({
  width = 100,
  height = 20,
  className,
  surface = "auto",
}: LogoProps) {
  if (surface === "onDark") {
    return (
      <Image
        src={logoLight}
        alt="Genzaic"
        width={width}
        height={height}
        className={className}
      />
    )
  }

  if (surface === "onLight") {
    return (
      <Image
        src={logoDark}
        alt="Genzaic"
        width={width}
        height={height}
        className={className}
      />
    )
  }

  // auto: render both, let the `.dark` class (set by next-themes before paint)
  // decide which is visible. No JS, no hydration flash, works in Server Components.
  return (
    <>
      <Image
        src={logoDark}
        alt="Genzaic"
        width={width}
        height={height}
        className={cn("block dark:hidden", className)}
      />
      <Image
        src={logoLight}
        alt="Genzaic"
        width={width}
        height={height}
        className={cn("hidden dark:block", className)}
      />
    </>
  )
}
