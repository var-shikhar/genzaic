interface DraftPreviewBannerProps {
  label: string
}

export function DraftPreviewBanner({ label }: DraftPreviewBannerProps) {
  return (
    <div className="sticky top-0 z-50 bg-primary text-primary-foreground py-2 px-4 text-center font-mono text-[11px] uppercase tracking-[0.18em]">
      Draft preview · {label}
    </div>
  )
}
