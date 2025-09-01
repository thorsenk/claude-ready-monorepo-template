import * as React from "react"
import { cn } from "@/lib/utils"

// Screen Reader Only Content
interface ScreenReaderOnlyProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export const ScreenReaderOnly = React.forwardRef<HTMLSpanElement, ScreenReaderOnlyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("sr-only", className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

ScreenReaderOnly.displayName = "ScreenReaderOnly"

// Skip Link for Keyboard Navigation
interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href, children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          "absolute left-0 top-0 z-50 -translate-y-full bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0",
          className
        )}
        {...props}
      >
        {children}
      </a>
    )
  }
)

SkipLink.displayName = "SkipLink"

// Focus Trap for Modals and Dropdowns
interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  restoreFocus?: boolean
  className?: string
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active = true, 
  restoreFocus = true,
  className
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const lastFocusedElement = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!active) return

    // Store the currently focused element
    if (restoreFocus) {
      lastFocusedElement.current = document.activeElement as HTMLElement
    }

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    // Focus first element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus
      if (restoreFocus && lastFocusedElement.current) {
        lastFocusedElement.current.focus()
      }
    }
  }, [active, restoreFocus])

  if (!active) return <>{children}</>

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Accessible Image with Loading States
interface AccessibleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  showLoadingState?: boolean
  aspectRatio?: "square" | "video" | "portrait" | "landscape"
}

export const AccessibleImage = React.forwardRef<HTMLImageElement, AccessibleImageProps>(
  ({ 
    src, 
    alt, 
    fallbackSrc,
    showLoadingState = true,
    aspectRatio,
    className,
    onLoad,
    onError,
    ...props 
  }, ref) => {
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(false)
    const [currentSrc, setCurrentSrc] = React.useState(src)

    const aspectRatioClass = {
      square: "aspect-square",
      video: "aspect-video", 
      portrait: "aspect-[3/4]",
      landscape: "aspect-[4/3]",
    }

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoading(false)
      setError(false)
      onLoad?.(e)
    }

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoading(false)
      setError(true)
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc)
        setLoading(true)
      }
      onError?.(e)
    }

    React.useEffect(() => {
      setCurrentSrc(src)
      setLoading(true)
      setError(false)
    }, [src])

    return (
      <div className={cn(
        "relative overflow-hidden",
        aspectRatio && aspectRatioClass[aspectRatio],
        className
      )}>
        {loading && showLoadingState && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="loading-shimmer w-full h-full"></div>
          </div>
        )}
        
        <img
          ref={ref}
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
          loading="lazy"
          {...props}
        />
        
        {error && !fallbackSrc && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
            Failed to load image
          </div>
        )}
      </div>
    )
  }
)

AccessibleImage.displayName = "AccessibleImage"

// Keyboard Navigation Indicator
export const KeyboardNavigationIndicator: React.FC = () => {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardNavigation(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  React.useEffect(() => {
    if (isKeyboardNavigation) {
      document.documentElement.classList.add('keyboard-navigation')
    } else {
      document.documentElement.classList.remove('keyboard-navigation')
    }
  }, [isKeyboardNavigation])

  return null
}

// Accessible Progress Indicator
interface AccessibleProgressProps {
  value: number
  max?: number
  label?: string
  description?: string
  showPercentage?: boolean
  size?: "sm" | "default" | "lg"
  variant?: "default" | "success" | "warning" | "destructive"
  className?: string
}

export const AccessibleProgress = React.forwardRef<HTMLDivElement, AccessibleProgressProps>(
  ({ 
    value, 
    max = 100, 
    label,
    description,
    showPercentage = true,
    size = "default",
    variant = "default",
    className,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: "h-2",
      default: "h-4", 
      lg: "h-6"
    }

    const variantClasses = {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning", 
      destructive: "bg-destructive"
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {(label || showPercentage) && (
          <div className="flex items-center justify-between text-sm">
            {label && <span className="font-medium">{label}</span>}
            {showPercentage && (
              <span className="text-muted-foreground">
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        )}
        
        <div 
          className={cn(
            "w-full bg-muted rounded-full overflow-hidden",
            sizeClasses[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || "Progress"}
          aria-describedby={description ? "progress-description" : undefined}
        >
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out rounded-full",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {description && (
          <p id="progress-description" className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    )
  }
)

AccessibleProgress.displayName = "AccessibleProgress"

// Color Contrast Utilities
export const colorContrastUtils = {
  // Calculate relative luminance
  getLuminance: (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  // Calculate contrast ratio
  getContrastRatio: (color1: string, color2: string) => {
    const lum1 = colorContrastUtils.getLuminance(color1)
    const lum2 = colorContrastUtils.getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA') => {
    const contrast = colorContrastUtils.getContrastRatio(color1, color2)
    return level === 'AA' ? contrast >= 4.5 : contrast >= 7
  }
}

// Reduced Motion Wrapper
interface ReducedMotionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ReducedMotion: React.FC<ReducedMotionProps> = ({ 
  children, 
  fallback 
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (prefersReducedMotion && fallback) {
    return <>{fallback}</>
  }

  return <>{children}</>
}