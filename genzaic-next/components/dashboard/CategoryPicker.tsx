"use client"

import { useMemo } from "react"
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

  // Derive (parentId, subId) directly from the form value + loaded categories.
  // Using useMemo (vs useState+useEffect) avoids a race where `value` arrives
  // before categories load — once categories resolve, this re-derives cleanly.
  const { parentId, subId } = useMemo(() => {
    if (!value) return { parentId: null as string | null, subId: null as string | null }
    const cat = byId.get(value)
    if (!cat) {
      // Value present but category map not loaded yet — assume it's a parent
      // tentatively so the trigger doesn't show "Select category" while the
      // map populates. Once categories arrive, this re-runs and corrects.
      return { parentId: value, subId: null as string | null }
    }
    if (cat.parentId) return { parentId: cat.parentId, subId: cat.id }
    return { parentId: cat.id, subId: null as string | null }
  }, [value, byId])

  const subOptions = parentId ? (childrenOf.get(parentId) ?? []) : []

  const handleParentChange = (next: string) => {
    if (next === CLEAR) {
      onChange(null)
      return
    }
    onChange(next)
  }

  const handleSubChange = (next: string) => {
    if (next === CLEAR) {
      onChange(parentId)
      return
    }
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
