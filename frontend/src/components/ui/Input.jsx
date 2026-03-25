import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
          error && "border-red-500 ring-red-100",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
