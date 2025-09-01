import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const statDisplayVariants = cva(
  "flex flex-col",
  {
    variants: {
      variant: {
        default: "",
        success: "text-success",
        warning: "text-warning",
        destructive: "text-destructive",
        info: "text-info",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const statValueVariants = cva(
  "font-bold",
  {
    variants: {
      size: {
        sm: "text-lg",
        default: "text-2xl",
        lg: "text-3xl",
        xl: "text-4xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface StatDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statDisplayVariants> {
  label: string
  value: string | number
  trend?: number
  suffix?: string
  prefix?: string
  description?: string
  icon?: React.ReactNode
  showTrend?: boolean
  animate?: boolean
}

const StatDisplay = React.forwardRef<HTMLDivElement, StatDisplayProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    value, 
    trend, 
    suffix, 
    prefix, 
    description, 
    icon,
    showTrend = false,
    animate = false,
    ...props 
  }, ref) => {
    const getTrendIcon = () => {
      if (!showTrend || trend === undefined) return null
      
      if (trend > 0) return <TrendingUp className="h-4 w-4 text-success" />
      if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }

    const getTrendColor = () => {
      if (!showTrend || trend === undefined) return ""
      if (trend > 0) return "text-success"
      if (trend < 0) return "text-destructive"
      return "text-muted-foreground"
    }

    return (
      <div
        ref={ref}
        className={cn(statDisplayVariants({ variant, size, className }))}
        {...props}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {icon}
            {label}
          </span>
          {showTrend && trend !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
              {getTrendIcon()}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          statValueVariants({ size }),
          animate && "animate-slide-up"
        )}>
          {prefix}
          <span className={variant && variant !== "default" ? "" : "text-gradient"}>
            {value}
          </span>
          {suffix}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    )
  }
)

StatDisplay.displayName = "StatDisplay"

export { StatDisplay, statDisplayVariants }