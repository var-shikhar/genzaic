"use client"

import { useEffect, useState } from "react"

export function TopProgressBar({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) {
      setProgress(100)
      const t = setTimeout(() => setProgress(0), 250)
      return () => clearTimeout(t)
    }
    setProgress(8)
    const id = setInterval(() => {
      setProgress((p) => Math.min(p + Math.max(1, (90 - p) / 10), 90))
    }, 200)
    return () => clearInterval(id)
  }, [active])

  if (progress === 0) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
