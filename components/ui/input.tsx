import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-secondary-200 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            'input-premium w-full',
                            icon && 'pl-12',
                            error && 'ring-2 ring-accent-500 border-accent-500',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-sm text-accent-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
