
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link"
  size?: "sm" | "md" | "lg" | "icon"
  asChild?: boolean
  loading?: boolean
}

const ButtonCustom = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      primary: "bg-coffee-green text-coffee-green-light shadow-sm hover:bg-coffee-green/90",
      secondary: "bg-coffee-green-light text-coffee-green hover:bg-coffee-green-light/90",
      outline: "border border-coffee-green text-coffee-green hover:bg-coffee-green hover:text-coffee-green-light",
      ghost: "text-coffee-green hover:bg-coffee-green-light/50",
      link: "text-coffee-green underline-offset-4 hover:underline"
    }
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 py-3 text-base",
      icon: "h-9 w-9"
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)

ButtonCustom.displayName = "ButtonCustom"

export { ButtonCustom }
