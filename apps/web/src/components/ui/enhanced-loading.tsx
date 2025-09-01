import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { Trophy, Loader2, Activity, BarChart3, TrendingUp } from "lucide-react"

const loadingVariants = cva(
  "flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        primary: "text-primary",
        success: "text-success",
        warning: "text-warning",
      },
      size: {
        sm: "h-16",
        default: "h-24",
        lg: "h-32",
        xl: "h-48",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface EnhancedLoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  message?: string
  showMessage?: boolean
  type?: 'spinner' | 'pulse' | 'skeleton' | 'fantasy'
}

const EnhancedLoading = React.forwardRef<HTMLDivElement, EnhancedLoadingProps>(
  ({ 
    className, 
    variant, 
    size, 
    message = "Loading data...",
    showMessage = true,
    type = 'fantasy',
    ...props 
  }, ref) => {
    if (type === 'skeleton') {
      return (
        <div ref={ref} className={cn(loadingVariants({ variant, size, className }))} {...props}>
          <div className="space-y-3 w-full max-w-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="loading-shimmer h-4 rounded w-3/4"></div>
                <div className="loading-shimmer h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (type === 'pulse') {
      return (
        <div ref={ref} className={cn(loadingVariants({ variant, size, className }))} {...props}>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-current rounded-full loading-pulse opacity-60"></div>
            {showMessage && <p className="text-sm font-medium">{message}</p>}
          </div>
        </div>
      )
    }

    if (type === 'fantasy') {
      return (
        <div ref={ref} className={cn(loadingVariants({ variant, size, className }))} {...props}>
          <div className="flex flex-col items-center space-y-6">
            {/* Animated Fantasy Icons */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-tertiary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg">
                <Trophy className="h-8 w-8 text-white animate-float" />
              </div>
            </div>
            
            {/* Animated Icons Ring */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 animate-spin">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                  <Activity className="h-4 w-4 text-tertiary" />
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-x-2 -translate-y-1/2">
                  <Trophy className="h-4 w-4 text-warning" />
                </div>
              </div>
            </div>

            {showMessage && (
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-gradient">{message}</p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-tertiary rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Default spinner
    return (
      <div ref={ref} className={cn(loadingVariants({ variant, size, className }))} {...props}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          {showMessage && <p className="text-sm font-medium">{message}</p>}
        </div>
      </div>
    )
  }
)

EnhancedLoading.displayName = "EnhancedLoading"

// Specialized loading components
export const ChartLoading: React.FC<{ height?: number }> = ({ height = 300 }) => {
  return (
    <div className="space-y-4" style={{ height }}>
      <div className="flex justify-between items-center mb-4">
        <div className="loading-shimmer h-6 w-48 rounded"></div>
        <div className="loading-shimmer h-4 w-20 rounded"></div>
      </div>
      <div className="loading-shimmer h-full w-full rounded-lg"></div>
    </div>
  )
}

export const CardLoading: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="loading-shimmer h-4 w-24 rounded"></div>
        <div className="loading-shimmer h-4 w-4 rounded"></div>
      </div>
      <div className="loading-shimmer h-8 w-16 rounded"></div>
      <div className="loading-shimmer h-3 w-32 rounded"></div>
    </div>
  )
}

export const TableLoading: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          <div className="loading-shimmer h-8 w-8 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="loading-shimmer h-4 w-full rounded"></div>
            <div className="loading-shimmer h-3 w-3/4 rounded"></div>
          </div>
          <div className="loading-shimmer h-6 w-16 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export { EnhancedLoading, loadingVariants }