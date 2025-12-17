'use client';

import { useState, useEffect, useCallback } from 'react';
import { throttle } from '@/lib/utils';

export function useActiveSection(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '');

  const updateActiveSection = useCallback(
    throttle(() => {
      const scrollPosition = window.scrollY + offset;
      
      // Find the section that is currently in view
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const element = document.getElementById(sectionIds[i]);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    }, 100),
    [sectionIds, offset]
  );

  useEffect(() => {
    // Set initial active section
    updateActiveSection();

    // Listen for scroll events
    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [updateActiveSection]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Height of fixed navigation
      const elementPosition = element.offsetTop - navHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      // Update active section immediately for better UX
      setActiveSection(sectionId);
    }
  }, []);

  return {
    activeSection,
    scrollToSection,
  };
}