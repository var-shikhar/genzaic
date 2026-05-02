import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full bg-transparent text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm",
  {
    variants: {
      variant: {
        default:   "h-10 px-3 py-2 rounded-md border border-input shadow-hairline",
        editorial: "h-9 px-0 border-0 border-b border-foreground/20 rounded-none focus-visible:ring-0 focus-visible:border-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => (
    <input
      type={type}
      className={cn(inputVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = "Input"

export { Input }
