import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-950';

        const variants = {
            primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-glow hover:scale-105 disabled:hover:scale-100',
            secondary: 'glass-hover text-gray-700 hover:text-blue-600',
            outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
            ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            danger: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100',
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
