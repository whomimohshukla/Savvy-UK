import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:   'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm hover:shadow-[0_4px_16px_rgba(16,185,129,0.3)] focus:ring-emerald-500',
  outline:   'border-2 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 focus:ring-emerald-400',
  ghost:     'text-green-700 hover:bg-emerald-50 hover:text-green-900 focus:ring-emerald-400',
  danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  secondary: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
  xl: 'px-8 py-4 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        'active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
