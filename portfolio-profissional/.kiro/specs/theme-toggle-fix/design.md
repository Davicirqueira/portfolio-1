# Design Document

## Overview

This design addresses the theme toggle functionality issue in the portfolio application. The root cause is a format incompatibility between CSS variables defined in `globals.css` (using hexadecimal values) and the Tailwind CSS configuration (expecting HSL values). The solution involves converting all CSS variables to use HSL format values that are compatible with Tailwind's `hsl()` function calls.

## Architecture

The theme system consists of several interconnected components:

```
ThemeScript (SSR) → ThemeProvider → useTheme → ThemeToggle
                                      ↓
                              Theme Utilities ← CSS Variables
```

**Key Components:**
- **ThemeScript**: Server-side script that prevents flash of unstyled content (FOUC)
- **ThemeProvider**: React context provider for theme state management
- **useTheme**: Custom hook managing theme state and localStorage persistence
- **ThemeToggle**: UI component for theme switching
- **Theme Utilities**: Helper functions for theme operations
- **CSS Variables**: Color definitions in `globals.css`

## Components and Interfaces

### CSS Variable System
The CSS variables need to be restructured to use HSL values:

```css
/* Current (problematic) format */
:root {
  --background: #ffffff;
}

/* Required format */
:root {
  --background: 0 0% 100%;  /* HSL values without hsl() wrapper */
}
```

### Theme Application Flow
1. **Initial Load**: ThemeScript applies theme before React hydration
2. **State Management**: useTheme hook manages current theme state
3. **User Interaction**: ThemeToggle triggers theme changes
4. **Persistence**: Theme preference saved to localStorage
5. **DOM Update**: CSS variables updated via data attributes

## Data Models

### ThemeMode Type
```typescript
type ThemeMode = 'light' | 'dark' | 'system';
```

### Theme State Interface
```typescript
interface ThemeState {
  currentTheme: ThemeMode;
  isDark: boolean;
  isLoaded: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}
```

### Color Variable Structure
```typescript
interface ColorVariables {
  background: string;      // HSL values: "0 0% 100%"
  foreground: string;      // HSL values: "0 0% 7%"
  primary: string;         // HSL values: "217 91% 60%"
  // ... other color variables
}
```

## Data Models

### CSS Variable Conversion Map
The following hexadecimal values need conversion to HSL format:

**Light Theme:**
- `#ffffff` → `0 0% 100%` (white)
- `#171717` → `0 0% 9%` (dark gray)
- `#3b82f6` → `217 91% 60%` (blue)
- `#f1f5f9` → `210 40% 96%` (light blue-gray)
- `#e2e8f0` → `213 27% 84%` (border gray)

**Dark Theme:**
- `#0a0a0a` → `0 0% 4%` (near black)
- `#ededed` → `0 0% 93%` (light gray)
- `#1e293b` → `215 28% 17%` (dark blue-gray)
- `#334155` → `215 25% 27%` (medium blue-gray)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Theme Toggle Responsiveness
*For any* theme toggle interaction, clicking the button should immediately update both the theme state and DOM attributes to reflect the new theme
**Validates: Requirements 1.1**

### Property 2: Theme Persistence
*For any* theme change, the selected theme preference should be stored in localStorage and retrievable on subsequent visits
**Validates: Requirements 1.2**

### Property 3: Theme Initialization
*For any* stored theme preference, the theme system should initialize with that preference when the application loads
**Validates: Requirements 1.3**

### Property 4: System Theme Fallback
*For any* application initialization without stored preferences, the theme system should default to the browser's system preference
**Validates: Requirements 1.4**

### Property 5: System Theme Reactivity
*For any* system preference change while in "system" mode, the theme should automatically update to match the new system preference
**Validates: Requirements 1.5**

### Property 6: CSS Variable Format Compatibility
*For any* CSS variable definition, the value should be in HSL format compatible with Tailwind's hsl() function calls
**Validates: Requirements 2.1**

### Property 7: Tailwind Color Resolution
*For any* Tailwind color class, it should resolve to the correct CSS variable value when applied to elements
**Validates: Requirements 2.2**

### Property 8: Dark Theme Variable Application
*For any* dark theme activation, all CSS variables should be set to their corresponding dark theme values
**Validates: Requirements 2.3**

### Property 9: Light Theme Variable Application
*For any* light theme activation, all CSS variables should be set to their corresponding light theme values
**Validates: Requirements 2.4**

### Property 10: Light Theme Icon Display
*For any* light theme state, the theme toggle should display the sun icon and hide the moon icon
**Validates: Requirements 3.1**

### Property 11: Dark Theme Icon Display
*For any* dark theme state, the theme toggle should display the moon icon and hide the sun icon
**Validates: Requirements 3.2**

### Property 12: Hover State Feedback
*For any* hover interaction on the theme toggle, appropriate hover styles should be applied to provide visual feedback
**Validates: Requirements 3.3**

### Property 13: Loading State Display
*For any* theme system initialization period, a loading placeholder should be displayed to prevent layout shift
**Validates: Requirements 3.4**

## Error Handling

### CSS Variable Fallbacks
- If HSL conversion fails, maintain original hex values as fallback
- Provide console warnings for invalid color formats
- Ensure theme system continues to function with partial variable sets

### LocalStorage Errors
- Handle localStorage access failures gracefully
- Fall back to system theme when storage is unavailable
- Provide user feedback for persistence failures

### System Theme Detection
- Handle cases where `matchMedia` is not supported
- Provide fallback to light theme for older browsers
- Ensure theme detection works in SSR environments

## Testing Strategy

### Unit Testing Approach
- Test individual theme utility functions with specific inputs
- Verify CSS variable format conversions
- Test localStorage operations with mock storage
- Validate theme state transitions with known inputs

### Property-Based Testing Approach
- Use **fast-check** as the property-based testing library for JavaScript/TypeScript
- Configure each property-based test to run a minimum of 100 iterations
- Generate random theme states and verify system behavior
- Test theme persistence across multiple state changes
- Validate CSS variable applications with generated color values

**Property-based testing requirements:**
- Each property-based test must be tagged with a comment referencing the design document property
- Use format: `**Feature: theme-toggle-fix, Property {number}: {property_text}**`
- Each correctness property must be implemented by a single property-based test
- Tests should focus on universal behaviors that hold across all valid inputs

### Integration Testing
- Test complete theme switching workflows
- Verify SSR and client-side hydration compatibility
- Test system theme change detection and response
- Validate theme persistence across browser sessions