import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className="loading-shimmer h-6 w-48 rounded" />
      <div className="space-y-2">
        <div className="loading-shimmer h-4 w-full rounded" />
        <div className="loading-shimmer h-4 w-3/4 rounded" />
        <div className="loading-shimmer h-4 w-1/2 rounded" />
      </div>
    </div>
  )
}