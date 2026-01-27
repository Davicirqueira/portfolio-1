import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '@/lib/context/AccessibilityContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component that uses the accessibility context
function TestComponent() {
  const { preferences, updatePreferences, resetPreferences, isHighContrast } = useAccessibility();

  return (
    <div>
      <div data-testid="high-contrast">{isHighContrast.toString()}</div>
      <div data-testid="font-size">{preferences.fontSize}</div>
      <div data-testid="reduced-motion">{preferences.reducedMotion.toString()}</div>
      
      <button 
        onClick={() => updatePreferences({ highContrast: true })}
        data-testid="enable-high-contrast"
      >
        Enable High Contrast
      </button>
      
      <button 
        onClick={() => updatePreferences({ fontSize: 'large' })}
        data-testid="set-large-font"
      >
        Set Large Font
      </button>
      
      <button 
        onClick={resetPreferences}
        data-testid="reset-preferences"
      >
        Reset
      </button>
    </div>
  );
}

describe('AccessibilityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('provides default accessibility preferences', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
    expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
  });

  test('loads preferences from localStorage', () => {
    const savedPreferences = JSON.stringify({
      highContrast: true,
      fontSize: 'large',
      reducedMotion: true,
    });
    mockLocalStorage.getItem.mockReturnValue(savedPreferences);

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
  });

  test('updates preferences correctly', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('enable-high-contrast'));
    
    await waitFor(() => {
      expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByTestId('set-large-font'));
    
    await waitFor(() => {
      expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    });
  });

  test('saves preferences to localStorage', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('enable-high-contrast'));
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'accessibility-preferences',
        expect.stringContaining('"highContrast":true')
      );
    });
  });

  test('resets preferences to defaults', async () => {
    const savedPreferences = JSON.stringify({
      highContrast: true,
      fontSize: 'large',
    });
    mockLocalStorage.getItem.mockReturnValue(savedPreferences);

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Verify initial loaded state
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    expect(screen.getByTestId('font-size')).toHaveTextContent('large');

    fireEvent.click(screen.getByTestId('reset-preferences'));
    
    await waitFor(() => {
      expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
      expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessibility-preferences');
  });

  test('applies CSS classes based on preferences', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('enable-high-contrast'));
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });
  });

  test('handles invalid localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json');
    
    // Should not throw an error
    expect(() => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );
    }).not.toThrow();

    // Should use default preferences
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
    expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
  });

  test('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibility must be used within an AccessibilityProvider');
    
    consoleSpy.mockRestore();
  });
});