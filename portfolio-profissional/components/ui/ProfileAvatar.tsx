'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { profileAvatarVariants, shimmerVariants } from '@/lib/config/animations';

export interface ProfileAvatarProps {
  section: 'about' | 'hero' | 'other';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showPhoto?: boolean;
  enableAnimations?: boolean;
}

interface AvatarState {
  isLoading: boolean;
  hasError: boolean;
  showFallback: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16 text-lg',
  md: 'w-24 h-24 text-2xl',
  lg: 'w-32 h-32 text-4xl md:w-40 md:h-40 md:text-5xl',
  xl: 'w-48 h-48 text-5xl md:w-64 md:h-64 md:text-6xl'
};

const animationVariants = profileAvatarVariants;

export function ProfileAvatar({ 
  section, 
  size = 'lg', 
  className = '', 
  showPhoto,
  enableAnimations = true 
}: ProfileAvatarProps) {
  const { personal } = usePortfolio();
  const [avatarState, setAvatarState] = useState<AvatarState>({
    isLoading: true, // Start with loading state
    hasError: false,
    showFallback: false
  });

  // Determine if we should show photo based on section and configuration
  const shouldShowPhoto = (showPhoto !== undefined ? showPhoto : (section === 'about' || section === 'hero')) && 
                          personal.profilePhoto && 
                          !avatarState.hasError &&
                          !avatarState.showFallback;

  const handleImageError = () => {
    console.warn(`Failed to load profile photo: ${personal.profilePhoto}`);
    setAvatarState(prev => ({
      ...prev,
      hasError: true,
      showFallback: true,
      isLoading: false
    }));
  };

  const handleImageLoad = () => {
    setAvatarState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      showFallback: false
    }));
  };

  const handleImageLoadStart = () => {
    setAvatarState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      showFallback: false
    }));
  };

  const initials = personal.name.split(' ').map(n => n[0]).join('');

  const baseClasses = `
    ${sizeClasses[size]} 
    bg-card border-2 border-foreground rounded-full 
    flex items-center justify-center 
    font-bold relative overflow-hidden group
    ${className}
  `;

  if (shouldShowPhoto) {
    return (
      <motion.div
        className={baseClasses}
        variants={enableAnimations ? animationVariants : undefined}
        initial={enableAnimations ? "initial" : undefined}
        animate={enableAnimations ? ["animate", "breathe"] : undefined}
        whileHover={enableAnimations ? "hover" : undefined}
        role="img"
        aria-label={`Foto profissional de ${personal.name}`}
      >
        {/* Try regular img tag first */}
        <img
          src={personal.profilePhoto!}
          alt={`Foto profissional de ${personal.name}`}
          className="w-full h-full rounded-full"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            position: 'absolute', 
            inset: 0,
            objectFit: 'cover',
            objectPosition: 'center top'
          }}
        />
        
        {/* Gradient overlay for hover effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 rounded-full"
          transition={{ duration: 0.5 }}
        />
        
        {/* Animated border gradient */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-0 group-hover:opacity-10 blur-xl"
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    );
  }

  // Fallback to initials
  return (
    <motion.div
      className={`${baseClasses} text-foreground`}
      variants={enableAnimations ? animationVariants : undefined}
      initial={enableAnimations ? "initial" : undefined}
      animate={enableAnimations ? ["animate", "breathe"] : undefined}
      whileHover={enableAnimations ? "hover" : undefined}
      role="img"
      aria-label={`Iniciais de ${personal.name}`}
    >
      {initials}
      
      {/* Gradient overlay for hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.5 }}
      />
      
      {/* Animated border gradient */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-0 group-hover:opacity-10 blur-xl"
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}