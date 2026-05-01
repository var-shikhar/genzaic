"use client"

import { useState, useMemo } from "react"
import { X, Plus, Tag as TagIcon } from "lucide-react"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useTagsSearch } from "@/lib/queries/tags"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface SelectedTag {
  id?: string
  name: string
}

interface TagsComboboxProps {
  value: SelectedTag[]
  onChange: (tags: SelectedTag[]) => void
  disabled?: boolean
}

export function TagsCombobox({ value, onChange, disabled }: TagsComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const debounced = useDebouncedValue(query, 200)
  const { data: results = [] } = useTagsSearch(debounced)

  const selectedNames = useMemo(
    () => new Set(value.map((t) => t.name.toLowerCase())),
    [value],
  )

  const filteredResults = results.filter((r) => !selectedNames.has(r.name.toLowerCase()))
  const trimmedQuery = query.trim()
  const queryHasMatch = filteredResults.some(
    (r) => r.name.toLowerCase() === trimmedQuery.toLowerCase(),
  )
  const showCreateNew =
    trimmedQuery.length > 0 && !queryHasMatch && !selectedNames.has(trimmedQuery.toLowerCase())

  const addTag = (tag: SelectedTag) => {
    onChange([...value, tag])
    setQuery("")
  }

  const removeTag = (name: string) => {
    onChange(value.filter((t) => t.name.toLowerCase() !== name.toLowerCase()))
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag.name} variant="secondary" className="gap-1 pl-2 pr-1">
              <TagIcon className="h-3 w-3" />
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => removeTag(tag.name)}
                className="rounded p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${tag.name}`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="w-full justify-start font-normal text-muted-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {filteredResults.length === 0 && !showCreateNew && (
                <CommandEmpty>No tags found.</CommandEmpty>
              )}
              {filteredResults.map((r) => (
                <CommandItem
                  key={r.id}
                  value={r.name}
                  onSelect={() => addTag({ id: r.id, name: r.name })}
                >
                  <TagIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  {r.name}
                </CommandItem>
              ))}
              {showCreateNew && (
                <CommandItem
                  value={`__create_${trimmedQuery}`}
                  onSelect={() => addTag({ name: trimmedQuery })}
                >
                  <Plus className="mr-2 h-3.5 w-3.5 text-primary" />
                  Create &ldquo;{trimmedQuery}&rdquo;
                </CommandItem>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
