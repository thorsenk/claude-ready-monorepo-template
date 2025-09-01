import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { Trophy, Crown, Star, Zap, Target, Award } from "lucide-react"

const performanceBadgeVariants = cva(
  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        champion: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white championship-glow",
        winner: "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg",
        playoff: "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md",
        average: "bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-sm",
        loser: "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-sm",
        consistent: "bg-gradient-to-r from-purple-400 to-violet-500 text-white shadow-lg",
        streak: "bg-gradient-to-r from-cyan-400 to-teal-500 text-white shadow-lg animate-pulse",
        default: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const iconMap = {
  champion: Crown,
  winner: Trophy,
  playoff: Star,
  average: Target,
  loser: Zap,
  consistent: Award,
  streak: Zap,
  default: Star,
}

export interface PerformanceBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof performanceBadgeVariants> {
  icon?: React.ReactNode
  hideIcon?: boolean
}

const PerformanceBadge = React.forwardRef<HTMLSpanElement, PerformanceBadgeProps>(
  ({ className, variant, size, icon, hideIcon = false, children, ...props }, ref) => {
    const IconComponent = variant ? iconMap[variant] : iconMap.default
    const displayIcon = icon || (!hideIcon && <IconComponent className="h-4 w-4" />)

    return (
      <span
        ref={ref}
        className={cn(performanceBadgeVariants({ variant, size, className }))}
        {...props}
      >
        {displayIcon}
        {children}
      </span>
    )
  }
)
PerformanceBadge.displayName = "PerformanceBadge"

// Helper function to determine badge variant based on performance metrics
export const getPerformanceBadgeVariant = (
  winPercentage: number,
  isChampion: boolean = false,
  isPlayoff: boolean = false,
  isConsistent: boolean = false,
  hasStreak: boolean = false
): PerformanceBadgeProps['variant'] => {
  if (isChampion) return "champion"
  if (hasStreak) return "streak"
  if (isConsistent) return "consistent"
  if (isPlayoff) return "playoff"
  
  if (winPercentage >= 0.7) return "winner"
  if (winPercentage >= 0.5) return "average"
  return "loser"
}

export { PerformanceBadge, performanceBadgeVariants }