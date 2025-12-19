import { AnimationConfig } from '@/lib/types/portfolio';

export const defaultAnimationConfig: AnimationConfig = {
  hover: {
    scale: 1.05,
    rotate: 2,
    duration: 0.3
  },
  entrance: {
    fadeIn: true,
    slideDirection: 'up',
    duration: 0.6
  },
  subtle: {
    breathe: true,
    glow: true
  }
};

export const profileAvatarVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const
    }
  },
  hover: {
    scale: 1.02,
    rotate: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut' as const
    }
  },
  breathe: {
    scale: [1, 1.01, 1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  },
  loading: {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  }
};

export const shimmerVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear' as const
    }
  }
};

export const glowVariants = {
  hover: {
    boxShadow: [
      '0 0 0 0 rgba(var(--primary), 0)',
      '0 0 20px 5px rgba(var(--primary), 0.3)',
      '0 0 0 0 rgba(var(--primary), 0)'
    ],
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const
    }
  }
};