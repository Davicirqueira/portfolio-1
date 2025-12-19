export const animationConfig = {
  // Durations
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
    verySlow: 2.0
  },

  // Easing functions
  easing: {
    easeOut: [0.25, 0.25, 0.25, 0.75],
    easeIn: [0.75, 0.25, 0.25, 0.25],
    easeInOut: [0.25, 0.46, 0.45, 0.94],
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: { type: 'spring', stiffness: 100, damping: 15 }
  },

  // Common variants
  variants: {
    fadeInUp: {
      hidden: { opacity: 0, y: 60 },
      visible: { opacity: 1, y: 0 }
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -60 },
      visible: { opacity: 1, y: 0 }
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0 }
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0 }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    slideInUp: {
      hidden: { y: '100%' },
      visible: { y: 0 }
    },
    slideInDown: {
      hidden: { y: '-100%' },
      visible: { y: 0 }
    }
  },

  // Stagger configurations
  stagger: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }
  },

  // Hover effects
  hover: {
    lift: {
      y: -5,
      transition: { duration: 0.3 }
    },
    scale: {
      scale: 1.05,
      transition: { duration: 0.3 }
    },
    glow: {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.3 }
    }
  },

  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: 'easeInOut' }
  }
};

// Utility function to get animation with reduced motion support
export function getAnimation(animationName: keyof typeof animationConfig.variants, respectReducedMotion = true) {
  if (respectReducedMotion && typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      };
    }
  }
  
  return animationConfig.variants[animationName];
}