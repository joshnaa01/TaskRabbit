import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
  }
  
  const sizes = {
    default: "h-11 px-6 py-2 rounded-xl text-sm font-semibold",
    sm: "h-9 px-4 rounded-lg text-xs font-semibold",
    lg: "h-14 px-10 rounded-2xl text-base font-bold",
    icon: "h-11 w-11 rounded-xl p-0 items-center justify-center flex",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
