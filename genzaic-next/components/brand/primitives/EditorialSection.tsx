import { cn } from "@/lib/utils"

interface EditorialSectionProps {
  number: string
  /** Italic accent digit inside number, e.g. "1" of "01". */
  accentDigit?: string
  label: string
  deck?: string
  children: React.ReactNode
  className?: string
}

export function EditorialSection({
  number,
  accentDigit,
  label,
  deck,
  children,
  className,
}: EditorialSectionProps) {
  let renderedNumber: React.ReactNode = number
  if (accentDigit) {
    const idx = number.indexOf(accentDigit)
    if (idx >= 0) {
      renderedNumber = (
        <>
          {number.slice(0, idx)}
          <span className="accent-word">{accentDigit}</span>
          {number.slice(idx + accentDigit.length)}
        </>
      )
    }
  }
  return (
    <section
      className={cn(
        "grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-6 sm:gap-6 py-10 sm:py-8 border-b border-border",
        className,
      )}
    >
      <div className="text-center sm:text-left">
        <div className="relative inline-flex items-center justify-center">
          {/* Mobile-only halftone-dot backdrop — printerly editorial feel,
              dots radiate from center and fade at the edges via an
              elliptical mask. Wider-than-tall so the halo doesn't bleed
              into the section label sitting beneath the number. */}
          <span
            aria-hidden
            className={cn(
              "sm:hidden pointer-events-none absolute -inset-[52px] rounded-full",
              "[background-image:radial-gradient(circle,hsl(var(--primary)/0.55)_1px,transparent_1.4px)]",
              "[background-size:7px_7px]",
              "[mask-image:radial-gradient(ellipse_72%_50%_at_center,black_36%,transparent_88%)]",
              "[-webkit-mask-image:radial-gradient(ellipse_72%_50%_at_center,black_36%,transparent_88%)]",
            )}
          />
          <div className="relative font-display text-5xl font-semibold tracking-[-0.04em] leading-none">
            {renderedNumber}
          </div>
        </div>
        <div className="relative z-[1] font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-6 sm:mt-3.5">
          {label}
        </div>
      </div>
      <div>
        {deck && (
          <h3 className="font-display italic text-lg text-muted-foreground font-medium mb-4">
            {deck}
          </h3>
        )}
        {children}
      </div>
    </section>
  )
}
