import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
};

export function Grid({ children, className, cols = { default: 1 }, gap = 'md' }: GridProps) {
  const gridClasses = cn(
    'grid',
    gapClasses[gap],
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  span?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function GridItem({ children, className, span }: GridItemProps) {
  const spanClasses = cn(
    span?.default && `col-span-${span.default}`,
    span?.sm && `sm:col-span-${span.sm}`,
    span?.md && `md:col-span-${span.md}`,
    span?.lg && `lg:col-span-${span.lg}`,
    span?.xl && `xl:col-span-${span.xl}`,
    className
  );

  return (
    <div className={spanClasses}>
      {children}
    </div>
  );
}