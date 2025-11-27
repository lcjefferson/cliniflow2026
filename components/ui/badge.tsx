import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'destructive' | 'outline';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-secondary-700 text-secondary-200',
            success: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
            warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
            danger: 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
            info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
            secondary: 'bg-gray-200 text-gray-700',
            destructive: 'bg-red-500/20 text-red-600 border border-red-500/30',
            outline: 'border border-current bg-transparent',
        } as const;

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

export { Badge };
