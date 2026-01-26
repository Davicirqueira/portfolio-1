'use client'

import { useCallback, useEffect } from 'react'
import { useMediaManager } from './useMediaManager'

interface ImageUsageTracker {
  trackImageUsage: (imageUrl: string, location: string) => Promise<void>
  untrackImageUsage: (imageUrl: string, location: string) => Promise<void>
  updateImageUsage: (oldUrl: string, newUrl: string, location: string) => Promise<void>
  getImageUsageLocations: (imageUrl: string) => string[]
  isImageUsed: (imageUrl: string) => boolean
}

/**
 * Hook for tracking image usage throughout the portfolio
 * This helps identify which images are being used where and enables cleanup of unused images
 */
export function useImageUsageTracker(): ImageUsageTracker {
  const { mediaFiles, trackFileUsage, untrackFileUsage } = useMediaManager()

  // Find media file by URL
  const findMediaFileByUrl = useCallback((url: string) => {
    return mediaFiles.find(file => file.url === url)
  }, [mediaFiles])

  // Track image usage in a specific location
  const trackImageUsage = useCallback(async (imageUrl: string, location: string) => {
    const mediaFile = findMediaFileByUrl(imageUrl)
    if (mediaFile) {
      await trackFileUsage(mediaFile.id, location)
    }
  }, [findMediaFileByUrl, trackFileUsage])

  // Untrack image usage from a specific location
  const untrackImageUsage = useCallback(async (imageUrl: string, location: string) => {
    const mediaFile = findMediaFileByUrl(imageUrl)
    if (mediaFile) {
      await untrackFileUsage(mediaFile.id, location)
    }
  }, [findMediaFileByUrl, untrackFileUsage])

  // Update image usage when an image is replaced
  const updateImageUsage = useCallback(async (oldUrl: string, newUrl: string, location: string) => {
    // Untrack old image
    if (oldUrl) {
      await untrackImageUsage(oldUrl, location)
    }
    
    // Track new image
    if (newUrl) {
      await trackImageUsage(newUrl, location)
    }
  }, [trackImageUsage, untrackImageUsage])

  // Get all locations where an image is used
  const getImageUsageLocations = useCallback((imageUrl: string): string[] => {
    const mediaFile = findMediaFileByUrl(imageUrl)
    return mediaFile?.usedIn || []
  }, [findMediaFileByUrl])

  // Check if an image is being used anywhere
  const isImageUsed = useCallback((imageUrl: string): boolean => {
    const locations = getImageUsageLocations(imageUrl)
    return locations.length > 0
  }, [getImageUsageLocations])

  return {
    trackImageUsage,
    untrackImageUsage,
    updateImageUsage,
    getImageUsageLocations,
    isImageUsed,
  }
}

/**
 * Usage tracking locations constants
 * These help standardize location names across the application
 */
export const USAGE_LOCATIONS = {
  // Home section
  HOME_PROFILE_PHOTO: 'home.profile_photo',
  HOME_BACKGROUND: 'home.background',
  
  // About section
  ABOUT_PROFILE_PHOTO: 'about.profile_photo',
  ABOUT_BACKGROUND: 'about.background',
  
  // Projects
  PROJECT_THUMBNAIL: (projectId: string) => `project.${projectId}.thumbnail`,
  PROJECT_GALLERY: (projectId: string, imageIndex: number) => `project.${projectId}.gallery.${imageIndex}`,
  
  // Skills
  SKILL_ICON: (skillId: string) => `skill.${skillId}.icon`,
  
  // Experience
  EXPERIENCE_COMPANY_LOGO: (experienceId: string) => `experience.${experienceId}.logo`,
  
  // Testimonials
  TESTIMONIAL_AVATAR: (testimonialId: string) => `testimonial.${testimonialId}.avatar`,
  
  // General
  GENERAL_BACKGROUND: 'general.background',
  GENERAL_LOGO: 'general.logo',
  GENERAL_FAVICON: 'general.favicon',
} as const

/**
 * Helper function to automatically track image usage when images are updated
 * This can be used in form components to automatically manage usage tracking
 */
export function useAutoImageUsageTracking(location: string) {
  const { trackImageUsage, untrackImageUsage, updateImageUsage } = useImageUsageTracker()

  const handleImageChange = useCallback(async (oldUrl: string | null, newUrl: string | null) => {
    if (oldUrl && newUrl && oldUrl !== newUrl) {
      // Image was replaced
      await updateImageUsage(oldUrl, newUrl, location)
    } else if (!oldUrl && newUrl) {
      // New image was added
      await trackImageUsage(newUrl, location)
    } else if (oldUrl && !newUrl) {
      // Image was removed
      await untrackImageUsage(oldUrl, location)
    }
  }, [location, trackImageUsage, untrackImageUsage, updateImageUsage])

  return { handleImageChange }
}