import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
  outline: 'border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring',
  ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-ring',
  link: 'text-primary underline-offset-4 hover:underline focus:ring-primary',
};

const sizeClasses = {
  sm: 'h-9 px-3 text-sm min-w-[36px]',
  md: 'h-11 px-4 py-2 min-w-[44px]', // 44px minimum for touch targets
  lg: 'h-12 px-6 py-3 text-lg min-w-[48px]',
  xl: 'h-14 px-8 py-4 text-xl min-w-[56px]',
};

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  asChild = false,
  ...props 
}: ButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95', // Subtle press feedback
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (asChild) {
    return (
      <span className={baseClasses}>
        {children}
      </span>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}

// Link variant that maintains button styling
interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}

export function ButtonLink({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonLinkProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'active:scale-95',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <a className={baseClasses} {...props}>
      {children}
    </a>
  );
}