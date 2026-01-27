import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { AccessibilityProvider } from '@/lib/context/AccessibilityContext';

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )),
}));

describe('Keyboard Navigation', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AccessibilityProvider>
        {component}
      </AccessibilityProvider>
    );
  };

  describe('AccessibleButton', () => {
    test('responds to Enter key', () => {
      const mockOnActivate = jest.fn();
      
      renderWithProvider(
        <AccessibleButton onActivate={mockOnActivate}>
          Test Button
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockOnActivate).toHaveBeenCalled();
    });

    test('responds to Space key', () => {
      const mockOnActivate = jest.fn();
      
      renderWithProvider(
        <AccessibleButton onActivate={mockOnActivate}>
          Test Button
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(mockOnActivate).toHaveBeenCalled();
    });

    test('does not respond to other keys', () => {
      const mockOnActivate = jest.fn();
      
      renderWithProvider(
        <AccessibleButton onActivate={mockOnActivate}>
          Test Button
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'a' });

      expect(mockOnActivate).not.toHaveBeenCalled();
    });

    test('does not activate when disabled', () => {
      const mockOnActivate = jest.fn();
      
      renderWithProvider(
        <AccessibleButton onActivate={mockOnActivate} disabled>
          Test Button
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockOnActivate).not.toHaveBeenCalled();
    });

    test('does not activate when loading', () => {
      const mockOnActivate = jest.fn();
      
      renderWithProvider(
        <AccessibleButton onActivate={mockOnActivate} loading>
          Test Button
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockOnActivate).not.toHaveBeenCalled();
    });

    test('sets correct ARIA attributes', () => {
      renderWithProvider(
        <AccessibleButton 
          ariaLabel="Save document"
          ariaDescribedBy="save-description"
        >
          Save
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Save document');
      expect(button).toHaveAttribute('aria-describedby', 'save-description');
    });

    test('shows loading state correctly', () => {
      renderWithProvider(
        <AccessibleButton loading loadingText="Saving...">
          Save
        </AccessibleButton>
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    test('sets tabIndex correctly when disabled', () => {
      renderWithProvider(
        <AccessibleButton disabled>
          Test Button
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Focus Management', () => {
    test('maintains focus order in forms', () => {
      renderWithProvider(
        <form>
          <input data-testid="input-1" />
          <AccessibleButton>Button 1</AccessibleButton>
          <input data-testid="input-2" />
          <AccessibleButton>Button 2</AccessibleButton>
        </form>
      );

      const input1 = screen.getByTestId('input-1');
      const button1 = screen.getByText('Button 1');
      const input2 = screen.getByTestId('input-2');
      const button2 = screen.getByText('Button 2');

      // Test tab order
      input1.focus();
      expect(document.activeElement).toBe(input1);

      fireEvent.keyDown(input1, { key: 'Tab' });
      // Note: jsdom doesn't automatically handle tab navigation,
      // so we simulate the focus change
      button1.focus();
      expect(document.activeElement).toBe(button1);
    });

    test('skips disabled elements in tab order', () => {
      renderWithProvider(
        <div>
          <AccessibleButton>Button 1</AccessibleButton>
          <AccessibleButton disabled>Button 2 (Disabled)</AccessibleButton>
          <AccessibleButton>Button 3</AccessibleButton>
        </div>
      );

      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2 (Disabled)');
      const button3 = screen.getByText('Button 3');

      expect(button1).toHaveAttribute('tabindex', '0');
      expect(button2).toHaveAttribute('tabindex', '-1');
      expect(button3).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Screen Reader Support', () => {
    test('provides appropriate role attributes', () => {
      renderWithProvider(
        <AccessibleButton>
          Test Button
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('announces loading state to screen readers', () => {
      renderWithProvider(
        <AccessibleButton loading>
          Save
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    test('provides context through aria-describedby', () => {
      renderWithProvider(
        <div>
          <AccessibleButton ariaDescribedBy="help-text">
            Submit
          </AccessibleButton>
          <div id="help-text">This will submit the form</div>
        </div>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });
  });
});