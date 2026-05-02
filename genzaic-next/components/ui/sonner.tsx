"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-background text-foreground border border-foreground rounded-lg shadow-hairline-lift font-display text-[15px] font-medium",
          description: "italic text-muted-foreground",
          actionButton: "bg-foreground text-background rounded-full px-3 py-1 text-xs",
          cancelButton: "bg-transparent text-muted-foreground text-xs",
          error: "border-flicker/60 text-foreground",
          success: "border-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
