import Link from "next/link"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"
import { InkWash } from "@/components/brand/motifs"

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-8 overflow-hidden">
      <InkWash />
      <div className="relative max-w-xl text-center">
        <EyebrowLabel>404 · The colophon</EyebrowLabel>
        <EditorsHeadline accentWord="missing." size="hero" className="mt-4">
          The page is missing.
        </EditorsHeadline>
        <p className="font-display italic text-base text-muted-foreground mt-4">
          We lost it somewhere in the archive. Try the desk — most things start there.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-8 font-body text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-colors"
        >
          — Return to the desk
        </Link>
      </div>
    </div>
  )
}
