'use client';

import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useKeyboardNavigation } from '@/lib/context/AccessibilityContext';
import { createKeyboardHandler } from '@/lib/utils/accessibility';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onActivate?: () => void;
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    ariaLabel, 
    ariaDescribedBy, 
    onActivate, 
    onClick,
    loading = false,
    loadingText = 'Loading...',
    disabled,
    className,
    ...props 
  }, ref) => {
    const { tabIndex } = useKeyboardNavigation();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      onClick?.(e);
      onActivate?.();
    };

    const handleKeyDown = createKeyboardHandler({
      onEnter: () => {
        if (!loading && !disabled) {
          onActivate?.();
        }
      },
      onSpace: () => {
        if (!loading && !disabled) {
          onActivate?.();
        }
      },
    });

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={loading || disabled}
        tabIndex={disabled ? -1 : tabIndex}
        disabled={disabled || loading}
        className={cn(
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'transition-all duration-200',
          loading && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            {loadingText}
          </span>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';