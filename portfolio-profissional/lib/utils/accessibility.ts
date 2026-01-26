// Accessibility utilities for WCAG 2.1 AA compliance

export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  screenReader: false,
  keyboardNavigation: true,
};

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

// ARIA utilities
export function generateAriaLabel(text: string, context?: string): string {
  if (context) {
    return `${text}, ${context}`;
  }
  return text;
}

export function generateAriaDescribedBy(id: string, description: string): { 
  'aria-describedby': string;
  descriptionId: string;
  descriptionText: string;
} {
  const descriptionId = `${id}-description`;
  return {
    'aria-describedby': descriptionId,
    descriptionId,
    descriptionText: description,
  };
}

// Keyboard navigation utilities
export function createKeyboardHandler(handlers: {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
}) {
  return (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        handlers.onEnter?.();
        break;
      case ' ':
        event.preventDefault();
        handlers.onSpace?.();
        break;
      case 'Escape':
        event.preventDefault();
        handlers.onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        handlers.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        handlers.onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        handlers.onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        handlers.onArrowRight?.();
        break;
      case 'Tab':
        handlers.onTab?.();
        break;
    }
  };
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Screen reader utilities
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Skip link utilities
export function createSkipLink(targetId: string, text: string) {
  return {
    href: `#${targetId}`,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md',
    children: text,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
}

// Font size utilities
export function getFontSizeClass(size: AccessibilityPreferences['fontSize']): string {
  switch (size) {
    case 'small': return 'text-sm';
    case 'medium': return 'text-base';
    case 'large': return 'text-lg';
    case 'extra-large': return 'text-xl';
    default: return 'text-base';
  }
}

// Motion utilities
export function getMotionPreference(): 'reduce' | 'no-preference' {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches ? 'reduce' : 'no-preference';
  }
  return 'no-preference';
}

// High contrast utilities
export function getHighContrastPreference(): boolean {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    return mediaQuery.matches;
  }
  return false;
}