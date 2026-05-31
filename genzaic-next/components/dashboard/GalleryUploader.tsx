"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ExistingGalleryImage {
  id: string
  imageUrl: string
}

interface NewImage {
  file: File
  previewUrl: string
}

interface GalleryUploaderProps {
  initial?: ExistingGalleryImage[]
  onChange: (state: { newFiles: File[]; removedIds: string[] }) => void
  disabled?: boolean
  max?: number
}

export function GalleryUploader({
  initial = [],
  onChange,
  disabled,
  max = 8,
}: GalleryUploaderProps) {
  const [existing, setExisting] = useState<ExistingGalleryImage[]>(initial)
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null)

  useEffect(() => {
    onChange({ newFiles: newImages.map((n) => n.file), removedIds })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newImages, removedIds])

  useEffect(() => {
    return () => {
      newImages.forEach((n) => URL.revokeObjectURL(n.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalCount = existing.length + newImages.length

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const remaining = max - totalCount
    if (remaining <= 0) return
    const accepted = Array.from(files).slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setNewImages((prev) => [...prev, ...accepted])
  }

  const removeExisting = (id: string) => {
    setExisting((prev) => prev.filter((e) => e.id !== id))
    setRemovedIds((prev) => [...prev, id])
  }

  const removeNew = (idx: number) => {
    setNewImages((prev) => {
      const target = prev[idx]
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // Merged ordered list — existing first, then newly-staged.
  type MergedItem =
    | { kind: "existing"; id: string; src: string; label: string }
    | { kind: "new"; idx: number; src: string; label: string }

  const merged: MergedItem[] = [
    ...existing.map((e) => ({
      kind: "existing" as const,
      id: e.id,
      src: e.imageUrl,
      label: (e.imageUrl.split("/").pop() ?? "image").split("?")[0],
    })),
    ...newImages.map((n, i) => ({
      kind: "new" as const,
      idx: i,
      src: n.previewUrl,
      label: n.file.name,
    })),
  ]

  const reorder = (from: number, to: number) => {
    if (from === to) return
    const arr = [...merged]
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    const newExisting: ExistingGalleryImage[] = []
    const newNew: NewImage[] = []
    arr.forEach((item) => {
      if (item.kind === "existing") {
        const e = existing.find((x) => x.id === item.id)
        if (e) newExisting.push(e)
      } else {
        const n = newImages[item.idx]
        if (n) newNew.push(n)
      }
    })
    setExisting(newExisting)
    setNewImages(newNew)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
        {merged.map((item, idx) => (
          <div
            key={item.kind === "existing" ? item.id : `new-${item.idx}`}
            draggable={!disabled}
            title={item.label}
            onDragStart={() => setDragSrcIdx(idx)}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverIdx(idx)
            }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={(e) => {
              e.preventDefault()
              if (dragSrcIdx !== null) reorder(dragSrcIdx, idx)
              setDragSrcIdx(null)
              setDragOverIdx(null)
            }}
            onDragEnd={() => {
              setDragSrcIdx(null)
              setDragOverIdx(null)
            }}
            className={cn(
              "group relative aspect-square rounded-md overflow-hidden bg-muted cursor-grab active:cursor-grabbing transition-all",
              idx === 0
                ? "ring-1 ring-primary ring-offset-2 ring-offset-background"
                : "border border-border",
              dragSrcIdx === idx && "opacity-50",
              dragOverIdx === idx &&
                dragSrcIdx !== idx &&
                "ring-2 ring-primary scale-[0.98]",
            )}
          >
            <Image
              src={item.src}
              alt={item.label}
              fill
              sizes="120px"
              className="object-cover pointer-events-none"
            />

            {/* Subtle gradient at the bottom keeps the position chip legible
                over light images. */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />

            {idx === 0 && (
              <span className="absolute top-1 left-1 font-mono text-[8px] uppercase tracking-[0.1em] px-1 py-px rounded-full bg-primary text-primary-foreground shadow-sm">
                Cover
              </span>
            )}

            <span className="absolute bottom-1 left-1 font-mono text-[9px] tracking-[0.06em] text-white/95 px-1 py-px rounded bg-black/55 backdrop-blur-sm">
              {idx + 1}
            </span>

            {item.kind === "new" && (
              <span className="absolute bottom-1 right-1 font-mono text-[8px] uppercase tracking-[0.08em] px-1 py-px rounded bg-primary/95 text-primary-foreground shadow-sm">
                New
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (item.kind === "existing") removeExisting(item.id)
                else removeNew(item.idx)
              }}
              className={cn(
                "absolute top-1 right-1 p-0.5 rounded-full bg-background/85 backdrop-blur-sm shadow-sm",
                "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
                "hover:bg-flicker hover:text-white text-foreground",
              )}
              aria-label={`Remove image ${idx + 1}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {totalCount < max && (
          <label
            className={cn(
              "flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-md cursor-pointer text-center px-1",
              "hover:border-primary hover:bg-primary/5 transition-colors",
            )}
          >
            <Upload className="w-4 h-4 text-muted-foreground mb-1" />
            <span className="font-display italic text-[11px] text-muted-foreground leading-tight">
              {totalCount === 0 ? "Add" : "Add more"}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ""
              }}
            />
          </label>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {totalCount} / {max} images · Drag to reorder · First image is the cover
      </p>
    </div>
  )
}
