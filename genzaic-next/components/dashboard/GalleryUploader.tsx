"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, X, GripVertical } from "lucide-react"
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
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
    | { kind: "existing"; id: string; src: string; label: string; sub: string }
    | { kind: "new"; idx: number; src: string; label: string; sub: string }

  const merged: MergedItem[] = [
    ...existing.map((e) => ({
      kind: "existing" as const,
      id: e.id,
      src: e.imageUrl,
      label: (e.imageUrl.split("/").pop() ?? "image").split("?")[0],
      sub: "uploaded",
    })),
    ...newImages.map((n, i) => ({
      kind: "new" as const,
      idx: i,
      src: n.previewUrl,
      label: n.file.name,
      sub: `${formatBytes(n.file.size)} · staged for upload`,
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
      {merged.length > 0 && (
        <ul className="border border-border rounded-md divide-y divide-border">
          {merged.map((item, idx) => (
            <li
              key={item.kind === "existing" ? item.id : `new-${item.idx}`}
              draggable={!disabled}
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
                "grid grid-cols-[24px_56px_1fr_auto] items-center gap-3 p-2.5 group transition-colors",
                dragOverIdx === idx && "bg-primary/5",
              )}
            >
              <div className="text-muted-foreground/60 group-hover:text-foreground cursor-grab transition-colors">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="relative w-14 h-14 rounded overflow-hidden bg-muted">
                <Image src={item.src} alt={item.label} fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-medium truncate">{item.label}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-0.5">
                  {idx + 1} of {merged.length} · {item.sub}
                </div>
              </div>
              <button
                type="button"
                onClick={() => (item.kind === "existing" ? removeExisting(item.id) : removeNew(item.idx))}
                className="p-2 hover:bg-flicker/10 text-flicker rounded-md"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalCount < max && (
        <label
          className={cn(
            "flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-border rounded-md cursor-pointer",
            "hover:border-primary hover:bg-primary/5 transition-colors",
          )}
        >
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="font-display italic text-sm text-muted-foreground">
            {totalCount === 0 ? "Add gallery images" : "Add more images"}
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

      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {totalCount} / {max} images. Drag to reorder.
      </p>
    </div>
  )
}
