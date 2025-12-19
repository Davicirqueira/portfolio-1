'use client';

import { motion } from 'framer-motion';

interface AvatarFallbackProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isLoading?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16 text-lg',
  md: 'w-24 h-24 text-2xl',
  lg: 'w-32 h-32 text-4xl',
  xl: 'w-64 h-64 text-6xl'
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear' as const
    }
  }
};

export function AvatarFallback({ 
  initials, 
  size = 'lg', 
  className = '', 
  isLoading = false 
}: AvatarFallbackProps) {
  const baseClasses = `
    ${sizeClasses[size]} 
    bg-card border-2 border-foreground rounded-full 
    flex items-center justify-center 
    font-bold relative overflow-hidden
    ${className}
  `;

  if (isLoading) {
    return (
      <motion.div
        className={`${baseClasses} bg-gradient-to-r from-muted via-card to-muted bg-[length:200%_100%]`}
        variants={shimmerVariants}
        animate="animate"
        role="img"
        aria-label="Carregando foto do perfil"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </motion.div>
    );
  }

  return (
    <div
      className={`${baseClasses} text-foreground`}
      role="img"
      aria-label={`Iniciais: ${initials}`}
    >
      {initials}
    </div>
  );
}