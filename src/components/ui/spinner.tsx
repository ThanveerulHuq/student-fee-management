import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current border-r-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-2",
        xl: "h-16 w-16 border-3",
        "2xl": "h-32 w-32 border-b-2"
      },
      variant: {
        default: "text-blue-600",
        secondary: "text-gray-600",
        destructive: "text-red-600",
        success: "text-green-600",
        warning: "text-yellow-600"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
  showLabel?: boolean
  center?: boolean
  fullScreen?: boolean
}

export function Spinner({
  className,
  size,
  variant,
  label,
  showLabel = true,
  center = false,
  fullScreen = false,
  ...props
}: SpinnerProps) {
  const spinnerElement = (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      aria-label={label || "Loading"}
      role="status"
      {...props}
    />
  )

  const content = (
    <div className={cn("flex flex-col items-center gap-2", center && "text-center")}>
      {spinnerElement}
      {showLabel && (
        <p className="text-sm text-gray-600">
          {label || "Loading..."}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    )
  }

  if (center) {
    return (
      <div className="flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

export function SpinnerIcon({ className, size, variant, ...props }: Omit<SpinnerProps, "label" | "showLabel" | "center" | "fullScreen">) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      aria-label="Loading"
      role="status"
      {...props}
    />
  )
}