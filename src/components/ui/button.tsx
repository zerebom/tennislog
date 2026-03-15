import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[16px] text-[15px] font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[var(--primary)] focus-visible:ring-2 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--primary-dark)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-[var(--primary-light)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-[12px] px-2.5 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-[12px] gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-[16px] px-6 has-[>svg]:px-4",
        icon: "size-12",
        "icon-xs": "size-7 rounded-[12px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
