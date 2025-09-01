import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { Trophy, Crown, Star, Zap, Shield, Target } from "lucide-react"

const teamAvatarVariants = cva(
  "relative inline-flex items-center justify-center rounded-full border-2 font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-muted border-border text-muted-foreground",
        champion: "bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-500 text-white shadow-lg",
        winner: "bg-gradient-to-r from-green-400 to-emerald-500 border-green-500 text-white shadow-md",
        playoff: "bg-gradient-to-r from-blue-400 to-indigo-500 border-blue-500 text-white shadow-sm",
        elite: "bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-500 text-white shadow-lg",
        primary: "bg-primary border-primary text-primary-foreground",
      },
      size: {
        sm: "w-8 h-8 text-xs",
        default: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
        "2xl": "w-20 h-20 text-xl",
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
  elite: Zap,
  primary: Shield,
  default: Target,
}

interface TeamAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof teamAvatarVariants> {
  name: string
  showIcon?: boolean
  showBadge?: boolean
  badgeContent?: React.ReactNode
  imageUrl?: string
  fallbackInitials?: string
  animate?: boolean
}

const TeamAvatar = React.forwardRef<HTMLDivElement, TeamAvatarProps>(
  ({ 
    className, 
    variant, 
    size, 
    name, 
    showIcon = false,
    showBadge = false,
    badgeContent,
    imageUrl,
    fallbackInitials,
    animate = false,
    ...props 
  }, ref) => {
    const IconComponent = variant ? iconMap[variant] : iconMap.default
    
    // Generate initials from name
    const getInitials = (name: string) => {
      if (fallbackInitials) return fallbackInitials
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <div
        ref={ref}
        className={cn(
          teamAvatarVariants({ variant, size, className }),
          animate && "hover:scale-110 hover:shadow-xl",
          variant === 'champion' && "championship-glow"
        )}
        title={name}
        {...props}
      >
        {/* Background Pattern for Champions */}
        {variant === 'champion' && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 via-orange-400/30 to-red-500/30 rounded-full animate-pulse"></div>
        )}

        {/* Team Image */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {showIcon ? (
              <IconComponent className={cn(
                size === 'sm' && "h-3 w-3",
                size === 'default' && "h-4 w-4", 
                size === 'lg' && "h-5 w-5",
                size === 'xl' && "h-6 w-6",
                size === '2xl' && "h-8 w-8"
              )} />
            ) : (
              <span className="font-bold">
                {getInitials(name)}
              </span>
            )}
          </div>
        )}

        {/* Badge */}
        {showBadge && badgeContent && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full border-2 border-background shadow-sm">
            {badgeContent}
          </div>
        )}

        {/* Champion Crown */}
        {variant === 'champion' && (
          <div className="absolute -top-2 -right-1 flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full shadow-lg animate-bounce">
            <Crown className="h-3 w-3 text-yellow-800" />
          </div>
        )}
      </div>
    )
  }
)

TeamAvatar.displayName = "TeamAvatar"

// Team Performance Indicator
interface TeamPerformanceIndicatorProps {
  winRate: number
  points: number
  rank: number
  isChampion?: boolean
  size?: "sm" | "default" | "lg"
  className?: string
}

export const TeamPerformanceIndicator: React.FC<TeamPerformanceIndicatorProps> = ({
  winRate,
  points,
  rank,
  isChampion = false,
  size = "default",
  className
}) => {
  const getPerformanceVariant = (): TeamAvatarProps['variant'] => {
    if (isChampion) return 'champion'
    if (winRate >= 0.75) return 'elite'
    if (winRate >= 0.6) return 'winner'
    if (winRate >= 0.5) return 'playoff'
    return 'default'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <TeamAvatar
        name={`Rank ${rank}`}
        variant={getPerformanceVariant()}
        size={size}
        showIcon={isChampion}
        animate
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          {(winRate * 100).toFixed(1)}% Win Rate
        </span>
        <span className="text-xs text-muted-foreground">
          {points.toFixed(1)} avg pts
        </span>
      </div>
    </div>
  )
}

// Team Roster Display
interface TeamRosterProps {
  teams: Array<{
    name: string
    winRate: number
    isChampion?: boolean
    imageUrl?: string
  }>
  maxDisplay?: number
  size?: TeamAvatarProps['size']
  className?: string
}

export const TeamRoster: React.FC<TeamRosterProps> = ({
  teams,
  maxDisplay = 5,
  size = "default",
  className
}) => {
  const displayTeams = teams.slice(0, maxDisplay)
  const remainingCount = Math.max(0, teams.length - maxDisplay)

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {displayTeams.map((team, index) => (
          <TeamAvatar
            key={team.name}
            name={team.name}
            variant={team.isChampion ? 'champion' : team.winRate > 0.6 ? 'winner' : 'default'}
            size={size}
            imageUrl={team.imageUrl}
            animate
            className="ring-2 ring-background hover:z-10"
            style={{ zIndex: displayTeams.length - index }}
          />
        ))}
        {remainingCount > 0 && (
          <div className={cn(
            teamAvatarVariants({ size }),
            "bg-muted border-border text-muted-foreground ring-2 ring-background"
          )}>
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
}

export { TeamAvatar, teamAvatarVariants }