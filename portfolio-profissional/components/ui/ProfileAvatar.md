# ProfileAvatar Component

## Overview

The `ProfileAvatar` component is an intelligent avatar component that conditionally displays either a professional photo or initials based on the section context. It's specifically designed to show the professional photo only in the "About" section while maintaining initials in other sections.

## Features

- **Conditional Rendering**: Shows photo in "about" section, initials elsewhere
- **Fallback Mechanism**: Gracefully falls back to initials if photo fails to load
- **Discrete Animations**: Subtle entrance, hover, and breathing animations
- **Performance Optimized**: Uses Next.js Image with lazy loading
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Full ARIA support and screen reader friendly

## Usage

```tsx
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';

// In About section (shows photo)
<ProfileAvatar 
  section="about"
  size="xl"
  enableAnimations={true}
/>

// In Hero section (shows initials)
<ProfileAvatar 
  section="hero"
  size="lg"
  enableAnimations={true}
/>

// In other sections (shows initials)
<ProfileAvatar 
  section="other"
  size="md"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `section` | `'about' \| 'hero' \| 'other'` | Required | Determines whether to show photo or initials |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | Size variant of the avatar |
| `className` | `string` | `''` | Additional CSS classes |
| `showPhoto` | `boolean` | `undefined` | Override automatic photo/initials logic |
| `enableAnimations` | `boolean` | `true` | Enable/disable animations |

## Size Variants

- **sm**: 64x64px (16x16 on mobile)
- **md**: 96x96px (24x24 on mobile)  
- **lg**: 128x128px (32x32 on mobile), 160x160px on desktop
- **xl**: 192x192px (48x48 on mobile), 256x256px on desktop

## Configuration

The component reads the professional photo path from the portfolio configuration:

```typescript
// lib/config/portfolio.ts
export const portfolioConfig = {
  personal: {
    // ... other fields
    profilePhoto: "/profile-photo.jpg", // Path to professional photo
  },
  // ...
};
```

## Animation Behavior

### Entrance Animation
- Fade-in with subtle vertical movement
- Duration: 0.6s with easeOut timing

### Hover Effects
- Scale: 1.05x
- Rotation: 2 degrees
- Gradient overlay and glow effect
- Duration: 0.3s with easeInOut timing

### Breathing Effect
- Continuous subtle scale animation (1.0x - 1.02x - 1.0x)
- Duration: 4s infinite loop
- Very subtle and non-intrusive

### Loading State
- Shimmer effect while image loads
- Smooth transition to loaded state

## Accessibility

- **Alt Text**: Descriptive alternative text for images
- **ARIA Labels**: Proper labeling for screen readers
- **Role Attributes**: Semantic role="img" for proper identification
- **Fallback Support**: Maintains accessibility when falling back to initials

## Error Handling

The component handles various error scenarios:

1. **Network Failures**: Automatic fallback to initials
2. **Invalid Paths**: Graceful degradation without breaking layout
3. **Missing Configuration**: Default behavior showing initials
4. **Loading Errors**: Console warning with fallback to initials

## Performance

- **Next.js Image**: Automatic optimization and WebP support
- **Lazy Loading**: Images load only when needed
- **Responsive Images**: Different sizes served based on screen size
- **Priority Loading**: About section photo loads with priority

## Examples

### Basic Usage
```tsx
<ProfileAvatar section="about" />
```

### Custom Size and Styling
```tsx
<ProfileAvatar 
  section="about"
  size="xl"
  className="border-4 border-primary"
/>
```

### Disabled Animations
```tsx
<ProfileAvatar 
  section="about"
  enableAnimations={false}
/>
```

### Force Show Photo
```tsx
<ProfileAvatar 
  section="hero"
  showPhoto={true}
/>
```

## Dependencies

- `framer-motion`: For animations
- `next/image`: For optimized image loading
- `@/lib/hooks/usePortfolio`: For portfolio configuration
- `@/lib/config/animations`: For animation variants