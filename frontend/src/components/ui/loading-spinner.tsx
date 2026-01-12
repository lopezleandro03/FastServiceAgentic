import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingSpinnerProps {
  /** Size of the spinner: 'sm' (24px), 'md' (40px), 'lg' (48px) */
  size?: 'sm' | 'md' | 'lg';
  /** Optional message to display below the spinner */
  message?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to center the spinner in its container with full height */
  fullHeight?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-4',
  lg: 'w-12 h-12 border-4',
};

/**
 * Standard loading spinner component for consistent loading states across the app
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  className,
  fullHeight = false,
}) => {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        fullHeight ? 'h-full min-h-[200px]' : 'py-16',
        className
      )}
    >
      <div 
        className={cn(
          'border-blue-600 border-t-transparent rounded-full animate-spin',
          sizeClasses[size]
        )}
        role="status"
        aria-label={message || 'Cargando'}
      />
      {message && (
        <p className="text-gray-600 text-sm mt-4">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
