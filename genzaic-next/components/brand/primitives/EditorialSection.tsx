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
        "grid grid-cols-[80px_1fr] gap-6 py-8 border-b border-border",
        className,
      )}
    >
      <div>
        <div className="font-display text-5xl font-semibold tracking-[-0.04em] leading-none">
          {renderedNumber}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-3.5">
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
