'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { throttle, resolveSectionId } from '@/lib/utils';

export function useActiveSection(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '');
  const sectionElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Cache section elements to avoid repeated DOM queries
  const cacheSectionElements = useCallback(() => {
    const elementsMap = new Map<string, HTMLElement>();
    
    sectionIds.forEach(sectionId => {
      try {
        const htmlId = resolveSectionId(sectionId);
        const element = document.getElementById(htmlId);
        if (element) {
          elementsMap.set(sectionId, element);
        } else {
          console.warn(`Section element not found for ID: ${htmlId} (navigation ID: ${sectionId})`);
        }
      } catch (error) {
        console.error(`Error caching section element for ${sectionId}:`, error);
      }
    });
    
    sectionElementsRef.current = elementsMap;
  }, [sectionIds]);

  const updateActiveSection = useCallback(
    throttle(() => {
      try {
        const scrollPosition = window.scrollY + offset;
        
        // Find the section that is currently in view
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const element = sectionElementsRef.current.get(sectionIds[i]);
          if (element) {
            const { offsetTop } = element;
            if (scrollPosition >= offsetTop) {
              setActiveSection(sectionIds[i]);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error updating active section:', error);
      }
    }, 100),
    [sectionIds, offset]
  );

  useEffect(() => {
    // Cache section elements on mount and when sectionIds change
    cacheSectionElements();
    
    // Set initial active section
    updateActiveSection();

    // Listen for scroll events
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [updateActiveSection, cacheSectionElements]);

  const scrollToSection = useCallback((sectionId: string) => {
    try {
      const element = sectionElementsRef.current.get(sectionId);
      if (element) {
        const navHeight = 80; // Height of fixed navigation
        const elementPosition = element.offsetTop - navHeight;
        
        window.scrollTo({
          top: Math.max(0, elementPosition), // Ensure position is not negative
          behavior: 'smooth'
        });
        
        // Update active section immediately for better UX
        setActiveSection(sectionId);
      } else {
        // Fallback: try to find element by resolved ID
        const htmlId = resolveSectionId(sectionId);
        const fallbackElement = document.getElementById(htmlId);
        if (fallbackElement) {
          const navHeight = 80;
          const elementPosition = fallbackElement.offsetTop - navHeight;
          
          window.scrollTo({
            top: Math.max(0, elementPosition),
            behavior: 'smooth'
          });
          
          setActiveSection(sectionId);
          
          // Update cache with found element
          sectionElementsRef.current.set(sectionId, fallbackElement);
        } else {
          console.warn(`Cannot scroll to section: element not found for ${sectionId} (HTML ID: ${htmlId})`);
        }
      }
    } catch (error) {
      console.error(`Error scrolling to section ${sectionId}:`, error);
    }
  }, []);

  return {
    activeSection,
    scrollToSection,
  };
}