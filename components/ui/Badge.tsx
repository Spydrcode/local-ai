import { HTMLAttributes, forwardRef } from 'react';

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
    
    const variants = {
      default: 'bg-slate-700/50 text-slate-300',
      success: 'bg-emerald-500/20 text-emerald-400',
      warning: 'bg-yellow-500/20 text-yellow-400',
      error: 'bg-red-500/20 text-red-400',
      info: 'bg-blue-500/20 text-blue-400'
    };
    
    const sizes = {
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm'
    };

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };