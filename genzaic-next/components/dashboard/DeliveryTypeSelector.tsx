"use client"

import { cn } from "@/lib/utils"

const options = [
  {
    value: "download",
    name: "Downloadable File",
    desc: "Upload once, deliver forever.",
  },
  {
    value: "external_link",
    name: "External Link",
    desc: "Send buyers somewhere you already host.",
  },
  {
    value: "manual",
    name: "Manual Delivery",
    desc: "Share email, phone, or WhatsApp after purchase.",
  },
] as const

interface DeliveryTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function DeliveryTypeSelector({
  value,
  onChange,
}: DeliveryTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
      {options.map((opt) => {
        const on = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "p-3 border rounded-md text-left transition-colors flex flex-col h-full",
              on
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-primary/5 hover:border-primary/50",
            )}
          >
            <div className="font-display text-base font-semibold break-words">
              {opt.name}
            </div>
            <div
              className={cn(
                "font-body text-[11px] mt-1 leading-snug",
                on ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {opt.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}
