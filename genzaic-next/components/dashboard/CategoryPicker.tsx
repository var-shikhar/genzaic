"use client"

import { useEffect, useMemo, useState } from "react"
import { useCategories, type Category } from "@/lib/queries/categories"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface CategoryPickerProps {
  /** The leaf-most selected category id. Caller stores a single id; component
   *  splits it into category + subcategory internally. */
  value: string | null | undefined
  onChange: (id: string | null) => void
  disabled?: boolean
}

const CLEAR = "__clear__"

export function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
  const { data: categories = [], isLoading } = useCategories()

  // Index parent → children
  const childrenOf = useMemo(() => {
    const m = new Map<string | null, Category[]>()
    for (const c of categories) {
      const key = c.parentId ?? null
      const arr = m.get(key) ?? []
      arr.push(c)
      m.set(key, arr)
    }
    for (const [k, arr] of m) {
      m.set(k, [...arr].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)))
    }
    return m
  }, [categories])

  const byId = useMemo(() => {
    const m = new Map<string, Category>()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  const topLevel = childrenOf.get(null) ?? []

  // Resolve incoming `value` into (parentId, subId) — value is whichever was
  // most recently picked. If it's a leaf, parentId is its parent; if it's a
  // top-level, subId is null.
  const [parentId, setParentId] = useState<string | null>(null)
  const [subId, setSubId] = useState<string | null>(null)

  useEffect(() => {
    if (!value) {
      setParentId(null)
      setSubId(null)
      return
    }
    const cat = byId.get(value)
    if (!cat) return
    if (cat.parentId) {
      setParentId(cat.parentId)
      setSubId(cat.id)
    } else {
      setParentId(cat.id)
      setSubId(null)
    }
  }, [value, byId])

  const subOptions = parentId ? (childrenOf.get(parentId) ?? []) : []

  const handleParentChange = (next: string) => {
    if (next === CLEAR) {
      setParentId(null)
      setSubId(null)
      onChange(null)
      return
    }
    setParentId(next)
    setSubId(null)
    onChange(next)
  }

  const handleSubChange = (next: string) => {
    if (next === CLEAR) {
      setSubId(null)
      onChange(parentId)
      return
    }
    setSubId(next)
    onChange(next)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Category</span>
        <Select value={parentId ?? ""} onValueChange={handleParentChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {topLevel.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No categories.</div>
            ) : (
              <SelectGroup>
                {parentId && (
                  <SelectItem value={CLEAR}>
                    <span className="text-muted-foreground">Clear selection</span>
                  </SelectItem>
                )}
                {topLevel.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Subcategory</span>
        <Select
          value={subId ?? ""}
          onValueChange={handleSubChange}
          disabled={disabled || !parentId || subOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={!parentId ? "Pick a category first" : subOptions.length === 0 ? "No subcategories" : "Optional"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {subId && (
                <SelectItem value={CLEAR}>
                  <span className="text-muted-foreground">Clear subcategory</span>
                </SelectItem>
              )}
              {subOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
