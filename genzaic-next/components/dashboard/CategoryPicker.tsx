"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, Folder } from "lucide-react"
import { useCategories, type Category } from "@/lib/queries/categories"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CategoryPickerProps {
  value: string | null | undefined
  onChange: (id: string | null) => void
  disabled?: boolean
}

interface CategoryNode extends Category {
  children: CategoryNode[]
}

function buildTree(rows: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>()
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }))
  const roots: CategoryNode[] = []
  rows.forEach((r) => {
    const node = map.get(r.id)!
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function CategoryRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: CategoryNode
  depth: number
  selectedId: string | null | undefined
  onSelect: (id: string) => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent rounded-md",
          selectedId === node.id && "bg-accent font-medium",
        )}
        style={{ paddingLeft: 12 + depth * 16 }}
      >
        <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">{node.name}</span>
        {selectedId === node.id && <Check className="h-3.5 w-3.5 text-primary" />}
      </button>
      {node.children.map((child) => (
        <CategoryRow
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

export function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
  const { data: categories = [], isLoading } = useCategories()
  const [open, setOpen] = useState(false)

  const tree = useMemo(() => buildTree(categories), [categories])
  const selected = useMemo(
    () => categories.find((c) => c.id === value) ?? null,
    [categories, value],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected?.name ?? (isLoading ? "Loading..." : "Select category")}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <ScrollArea className="max-h-72">
          <div className="space-y-0.5">
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent rounded-md"
              >
                Clear selection
              </button>
            )}
            {tree.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground">No categories.</p>
            )}
            {tree.map((node) => (
              <CategoryRow
                key={node.id}
                node={node}
                depth={0}
                selectedId={value}
                onSelect={(id) => {
                  onChange(id)
                  setOpen(false)
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
