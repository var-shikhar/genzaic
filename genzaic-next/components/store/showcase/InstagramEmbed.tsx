"use client"

import { useEffect } from "react"
import type { ShowcaseKind } from "@/lib/showcase/types"

// Public Instagram embed script URL. Loaded at most once per page.
const SCRIPT_SRC = "https://www.instagram.com/embed.js"

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

let scriptPromise: Promise<void> | null = null

function loadInstagramEmbedScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.instgrm) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    )
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("script error")), { once: true })
      return
    }
    const s = document.createElement("script")
    s.src = SCRIPT_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("script error"))
    document.body.appendChild(s)
  })
  return scriptPromise
}

interface InstagramEmbedProps {
  shortcode: string
  kind: ShowcaseKind // "post" | "reel" | "tv"
  className?: string
}

export function InstagramEmbed({
  shortcode,
  kind,
  className,
}: InstagramEmbedProps) {
  const segment = kind === "post" ? "p" : kind === "reel" ? "reel" : "tv"
  const permalink = `https://www.instagram.com/${segment}/${shortcode}/`

  useEffect(() => {
    let cancelled = false
    loadInstagramEmbedScript()
      .then(() => {
        if (cancelled) return
        // process() walks the DOM for any .instagram-media blockquotes that
        // haven't been hydrated yet and renders them as iframes.
        window.instgrm?.Embeds.process()
      })
      .catch(() => {
        // Network blocked / script error — the blockquote stays as a styled
        // fallback link, which is Instagram's built-in degradation.
      })
    return () => {
      cancelled = true
    }
  }, [shortcode, kind])

  return (
    <blockquote
      className={`instagram-media ${className ?? ""}`}
      data-instgrm-permalink={permalink}
      data-instgrm-version="14"
      style={{
        background: "#FFF",
        border: 0,
        borderRadius: 3,
        boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
        margin: "1px",
        maxWidth: "540px",
        minWidth: "326px",
        padding: 0,
        width: "calc(100% - 2px)",
      }}
    >
      <a
        href={permalink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#FFFFFF",
          lineHeight: 0,
          padding: 0,
          textAlign: "center",
          textDecoration: "none",
          width: "100%",
        }}
      >
        View on Instagram
      </a>
    </blockquote>
  )
}
