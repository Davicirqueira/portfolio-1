import React from 'react';
import { Container } from './Container';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  background?: 'default' | 'muted' | 'accent';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const backgroundClasses = {
  default: 'bg-background',
  muted: 'bg-muted/30',
  accent: 'bg-accent/30',
};

const paddingClasses = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-20',
  xl: 'py-20 md:py-24',
};

export function Section({ 
  id, 
  children, 
  className, 
  containerSize = 'lg',
  background = 'default',
  padding = 'lg'
}: SectionProps) {
  return (
    <section 
      id={id}
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        className
      )}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  );
}