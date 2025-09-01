import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"

const responsiveGridVariants = cva(
  "grid gap-4",
  {
    variants: {
      variant: {
        auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        cards: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        metrics: "grid-cols-2 md:grid-cols-4",
        charts: "grid-cols-1 lg:grid-cols-2",
        dashboard: "grid-cols-1 lg:grid-cols-12",
        layout: "grid-cols-1 lg:grid-cols-3",
      },
      spacing: {
        tight: "gap-3",
        default: "gap-4",
        relaxed: "gap-6",
        loose: "gap-8",
      },
      responsive: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "auto",
      spacing: "default",
      responsive: true,
    },
  }
)

interface ResponsiveGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof responsiveGridVariants> {
  children: React.ReactNode
  minItemWidth?: string
  maxColumns?: number
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    variant, 
    spacing, 
    responsive,
    children, 
    minItemWidth,
    maxColumns,
    style,
    ...props 
  }, ref) => {
    const gridStyle = React.useMemo(() => {
      if (minItemWidth && maxColumns) {
        return {
          ...style,
          gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`,
          gridTemplateRows: 'masonry', // Future CSS feature
        }
      }
      return style
    }, [style, minItemWidth, maxColumns])

    return (
      <div
        ref={ref}
        className={cn(responsiveGridVariants({ variant, spacing, responsive, className }))}
        style={gridStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = "ResponsiveGrid"

// Responsive Container Component
interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  centerContent?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const responsiveContainerVariants = cva(
  "w-full",
  {
    variants: {
      maxWidth: {
        sm: "max-w-screen-sm",
        md: "max-w-screen-md", 
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        "2xl": "max-w-screen-2xl",
        full: "max-w-full",
      },
      centerContent: {
        true: "mx-auto",
        false: "",
      },
      padding: {
        none: "",
        sm: "px-4",
        md: "px-6",
        lg: "px-8",
      },
    },
    defaultVariants: {
      maxWidth: "full",
      centerContent: true,
      padding: "md",
    },
  }
)

export const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ className, maxWidth, centerContent, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(responsiveContainerVariants({ maxWidth, centerContent, padding, className }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveContainer.displayName = "ResponsiveContainer"

// Responsive Stack Component (Vertical layout with responsive spacing)
interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spacing?: "tight" | "default" | "relaxed" | "loose"
  align?: "start" | "center" | "end" | "stretch"
  responsive?: boolean
}

const responsiveStackVariants = cva(
  "flex flex-col",
  {
    variants: {
      spacing: {
        tight: "space-y-2",
        default: "space-y-4",
        relaxed: "space-y-6",
        loose: "space-y-8",
      },
      align: {
        start: "items-start",
        center: "items-center", 
        end: "items-end",
        stretch: "items-stretch",
      },
      responsive: {
        true: "sm:space-y-6 md:space-y-8",
        false: "",
      },
    },
    defaultVariants: {
      spacing: "default",
      align: "stretch",
      responsive: true,
    },
  }
)

export const ResponsiveStack = React.forwardRef<HTMLDivElement, ResponsiveStackProps>(
  ({ className, spacing, align, responsive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(responsiveStackVariants({ spacing, align, responsive, className }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveStack.displayName = "ResponsiveStack"

// Responsive Flex Component (Horizontal layout with responsive behavior)
interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: "row" | "col" | "responsive"
  spacing?: "tight" | "default" | "relaxed" | "loose"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  wrap?: boolean
}

const responsiveFlexVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        col: "flex-col",
        responsive: "flex-col sm:flex-row",
      },
      spacing: {
        tight: "gap-2",
        default: "gap-4",
        relaxed: "gap-6", 
        loose: "gap-8",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end", 
        stretch: "items-stretch",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
      wrap: {
        true: "flex-wrap",
        false: "flex-nowrap",
      },
    },
    defaultVariants: {
      direction: "row",
      spacing: "default",
      align: "center",
      justify: "start",
      wrap: false,
    },
  }
)

export const ResponsiveFlex = React.forwardRef<HTMLDivElement, ResponsiveFlexProps>(
  ({ 
    className, 
    direction, 
    spacing, 
    align, 
    justify, 
    wrap, 
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(responsiveFlexVariants({ 
          direction, 
          spacing, 
          align, 
          justify, 
          wrap, 
          className 
        }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveFlex.displayName = "ResponsiveFlex"

// Mobile-first breakpoint utilities
export const breakpoints = {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const

export type Breakpoint = keyof typeof breakpoints

// Hook for responsive behavior
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState<Breakpoint>('sm')

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width >= 1536) setScreenSize('2xl')
      else if (width >= 1280) setScreenSize('xl')
      else if (width >= 1024) setScreenSize('lg')
      else if (width >= 768) setScreenSize('md')
      else setScreenSize('sm')
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const isMobile = screenSize === 'sm'
  const isTablet = screenSize === 'md'
  const isDesktop = ['lg', 'xl', '2xl'].includes(screenSize)

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  }
}

export { ResponsiveGrid, responsiveGridVariants }