"use client"

import { Download, ExternalLink, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const options = [
  {
    value: "download",
    label: "File Download",
    description: "Upload a file for buyers to download",
    icon: Download,
  },
  {
    value: "external_link",
    label: "External Link",
    description: "Redirect buyers to an external URL",
    icon: ExternalLink,
  },
  {
    value: "manual",
    label: "Manual Delivery",
    description: "Deliver via email, phone, or WhatsApp",
    icon: MessageSquare,
  },
] as const

interface DeliveryTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function DeliveryTypeSelector({ value, onChange }: DeliveryTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all",
            value === option.value
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-accent"
          )}
        >
          <div
            className={cn(
              "rounded-md p-1.5",
              value === option.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            <option.icon className="h-4 w-4" />
          </div>
          <div>
            <p className={cn("text-sm font-medium", value === option.value && "text-primary")}>{option.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
