import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  ResponsiveContainer, 
  Tooltip, 
  TooltipProps,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"

// Enhanced Chart Colors
export const ENHANCED_CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))',
  sextary: 'hsl(var(--chart-6))',
  septenary: 'hsl(var(--chart-7))',
  octonary: 'hsl(var(--chart-8))',
} as const

export const CHART_COLOR_ARRAY = Object.values(ENHANCED_CHART_COLORS)

// Enhanced Chart Container
interface EnhancedChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  height?: number
  loading?: boolean
  title?: string
  description?: string
}

export const EnhancedChartContainer = React.forwardRef<HTMLDivElement, EnhancedChartContainerProps>(
  ({ className, children, height = 350, loading = false, title, description, ...props }, ref) => {
    if (loading) {
      return (
        <div 
          ref={ref}
          className={cn("chart-container", className)}
          style={{ height }}
          {...props}
        >
          <div className="flex items-center justify-center h-full">
            <div className="loading-shimmer w-full h-full rounded-lg"></div>
          </div>
        </div>
      )
    }

    return (
      <div 
        ref={ref}
        className={cn("chart-container", className)}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4 px-1">
            {title && (
              <h3 className="text-lg font-semibold text-gradient">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </div>
    )
  }
)
EnhancedChartContainer.displayName = "EnhancedChartContainer"

// Enhanced Tooltip
interface EnhancedTooltipProps extends Omit<TooltipProps<any, any>, 'content'> {
  formatter?: (value: any, name: string) => [React.ReactNode, string]
  labelFormatter?: (value: any) => React.ReactNode
  showLabel?: boolean
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  formatter,
  labelFormatter,
  showLabel = true,
  ...props
}) => {
  return (
    <Tooltip
      contentStyle={{
        backgroundColor: 'hsl(var(--card) / 0.95)',
        border: '1px solid hsl(var(--border) / 0.5)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-xl)',
        backdropFilter: 'blur(12px)',
        fontSize: '14px',
        padding: '12px',
      }}
      labelStyle={{
        color: 'hsl(var(--foreground))',
        fontWeight: '600',
        marginBottom: '8px',
      }}
      formatter={formatter}
      labelFormatter={labelFormatter}
      {...props}
    />
  )
}

// Enhanced Cartesian Grid
export const EnhancedCartesianGrid: React.FC<React.ComponentProps<typeof CartesianGrid>> = (props) => {
  return (
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="hsl(var(--border))"
      strokeOpacity={0.3}
      {...props}
    />
  )
}

// Enhanced X Axis
interface EnhancedXAxisProps extends React.ComponentProps<typeof XAxis> {
  variant?: 'default' | 'minimal'
}

export const EnhancedXAxis: React.FC<EnhancedXAxisProps> = ({ 
  variant = 'default', 
  ...props 
}) => {
  const baseProps = {
    stroke: 'hsl(var(--muted-foreground))',
    fontSize: 12,
    tickLine: variant === 'minimal' ? false : true,
    axisLine: variant === 'minimal' ? false : true,
    ...props
  }

  return <XAxis {...baseProps} />
}

// Enhanced Y Axis
interface EnhancedYAxisProps extends React.ComponentProps<typeof YAxis> {
  variant?: 'default' | 'minimal'
}

export const EnhancedYAxis: React.FC<EnhancedYAxisProps> = ({ 
  variant = 'default', 
  ...props 
}) => {
  const baseProps = {
    stroke: 'hsl(var(--muted-foreground))',
    fontSize: 12,
    tickLine: variant === 'minimal' ? false : true,
    axisLine: variant === 'minimal' ? false : true,
    ...props
  }

  return <YAxis {...baseProps} />
}

// Chart utilities
export const formatChartValue = (value: number, type: 'number' | 'percentage' | 'currency' = 'number'): string => {
  switch (type) {
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value)
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

export const getChartColor = (index: number): string => {
  return CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
}

// Gradient definitions for enhanced charts
export const ChartGradients: React.FC = () => {
  return (
    <defs>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={ENHANCED_CHART_COLORS.primary} stopOpacity={0.8} />
        <stop offset="100%" stopColor={ENHANCED_CHART_COLORS.primary} stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={ENHANCED_CHART_COLORS.secondary} stopOpacity={0.8} />
        <stop offset="100%" stopColor={ENHANCED_CHART_COLORS.secondary} stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="tertiaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={ENHANCED_CHART_COLORS.tertiary} stopOpacity={0.8} />
        <stop offset="100%" stopColor={ENHANCED_CHART_COLORS.tertiary} stopOpacity={0.1} />
      </linearGradient>
    </defs>
  )
}