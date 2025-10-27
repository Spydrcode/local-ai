import { HTMLAttributes } from 'react';

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'white';
}

export function LoadingSpinner({ 
  className, 
  size = 'md', 
  color = 'emerald',
  ...props 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const colors = {
    emerald: 'border-emerald-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizes[size],
        colors[color],
        className
      )}
      {...props}
    />
  );
}

interface LoadingStateProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  title = 'Loading...', 
  description,
  size = 'md' 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size={size} className="mb-4" />
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 text-center max-w-sm">{description}</p>
      )}
    </div>
  );
}