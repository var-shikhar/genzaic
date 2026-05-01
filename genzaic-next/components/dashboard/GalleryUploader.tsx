"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    onChange({
      newFiles: newImages.map((n) => n.file),
      removedIds,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newImages, removedIds])

  // Cleanup blob URLs on unmount.
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

  // Drag-reorder applies to the merged list (existing first, then new).
  const merged = [
    ...existing.map((e) => ({ kind: "existing" as const, id: e.id, src: e.imageUrl })),
    ...newImages.map((n, i) => ({ kind: "new" as const, idx: i, src: n.previewUrl })),
  ]

  const reorder = (from: number, to: number) => {
    if (from === to) return
    const reorderedExisting = [...existing]
    const reorderedNew = [...newImages]
    // Convert merged list to two separate ordered arrays after reordering.
    const arr = [...merged]
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    const newExisting: ExistingGalleryImage[] = []
    const newNew: NewImage[] = []
    arr.forEach((item) => {
      if (item.kind === "existing") {
        const e = reorderedExisting.find((x) => x.id === item.id)
        if (e) newExisting.push(e)
      } else {
        const n = reorderedNew[item.idx]
        if (n) newNew.push(n)
      }
    })
    setExisting(newExisting)
    setNewImages(newNew)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {merged.map((item, idx) => (
          <div
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
              "relative aspect-square rounded-md overflow-hidden border bg-muted group",
              dragOverIdx === idx && "ring-2 ring-primary",
            )}
          >
            <Image src={item.src} alt="" fill sizes="200px" className="object-cover" />
            <div className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 cursor-grab transition-opacity">
              <GripVertical className="h-3 w-3" />
            </div>
            <button
              type="button"
              onClick={() =>
                item.kind === "existing" ? removeExisting(item.id) : removeNew(item.idx)
              }
              className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded hover:bg-black/80"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {totalCount < max && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors">
            <Upload className="w-5 h-5 mb-1 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {totalCount} / {max} images. Drag to reorder.
      </p>
    </div>
  )
}
