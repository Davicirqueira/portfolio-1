import {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  generateAriaLabel,
  generateAriaDescribedBy,
  createKeyboardHandler,
  getFontSizeClass,
} from '@/lib/utils/accessibility';

describe('Accessibility Utils', () => {
  describe('Color Contrast', () => {
    test('calculates contrast ratio correctly', () => {
      // Black on white should have high contrast
      const blackOnWhite = getContrastRatio('#000000', '#ffffff');
      expect(blackOnWhite).toBeCloseTo(21, 1);

      // Same colors should have no contrast
      const sameColor = getContrastRatio('#ff0000', '#ff0000');
      expect(sameColor).toBe(1);
    });

    test('meets WCAG AA standards', () => {
      // High contrast should pass AA
      expect(meetsWCAGAA('#000000', '#ffffff')).toBe(true);
      
      // Low contrast should fail AA
      expect(meetsWCAGAA('#cccccc', '#ffffff')).toBe(false);
    });

    test('meets WCAG AAA standards', () => {
      // Very high contrast should pass AAA
      expect(meetsWCAGAAA('#000000', '#ffffff')).toBe(true);
      
      // Medium contrast should fail AAA
      expect(meetsWCAGAAA('#666666', '#ffffff')).toBe(false);
    });
  });

  describe('ARIA Utilities', () => {
    test('generates aria labels correctly', () => {
      expect(generateAriaLabel('Save')).toBe('Save');
      expect(generateAriaLabel('Save', 'document')).toBe('Save, document');
    });

    test('generates aria-describedby attributes', () => {
      const result = generateAriaDescribedBy('button-1', 'This saves the document');
      
      expect(result['aria-describedby']).toBe('button-1-description');
      expect(result.descriptionId).toBe('button-1-description');
      expect(result.descriptionText).toBe('This saves the document');
    });
  });

  describe('Keyboard Navigation', () => {
    test('creates keyboard handler with correct key mappings', () => {
      const mockHandlers = {
        onEnter: jest.fn(),
        onSpace: jest.fn(),
        onEscape: jest.fn(),
        onArrowUp: jest.fn(),
      };

      const handler = createKeyboardHandler(mockHandlers);

      // Test Enter key
      const enterEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as any;
      handler(enterEvent);
      expect(mockHandlers.onEnter).toHaveBeenCalled();
      expect(enterEvent.preventDefault).toHaveBeenCalled();

      // Test Space key
      const spaceEvent = {
        key: ' ',
        preventDefault: jest.fn(),
      } as any;
      handler(spaceEvent);
      expect(mockHandlers.onSpace).toHaveBeenCalled();
      expect(spaceEvent.preventDefault).toHaveBeenCalled();

      // Test Escape key
      const escapeEvent = {
        key: 'Escape',
        preventDefault: jest.fn(),
      } as any;
      handler(escapeEvent);
      expect(mockHandlers.onEscape).toHaveBeenCalled();
      expect(escapeEvent.preventDefault).toHaveBeenCalled();

      // Test Arrow Up key
      const arrowUpEvent = {
        key: 'ArrowUp',
        preventDefault: jest.fn(),
      } as any;
      handler(arrowUpEvent);
      expect(mockHandlers.onArrowUp).toHaveBeenCalled();
      expect(arrowUpEvent.preventDefault).toHaveBeenCalled();
    });

    test('ignores unmapped keys', () => {
      const mockHandlers = {
        onEnter: jest.fn(),
      };

      const handler = createKeyboardHandler(mockHandlers);

      const unmappedEvent = {
        key: 'a',
        preventDefault: jest.fn(),
      } as any;
      handler(unmappedEvent);
      
      expect(mockHandlers.onEnter).not.toHaveBeenCalled();
      expect(unmappedEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Font Size Utilities', () => {
    test('returns correct font size classes', () => {
      expect(getFontSizeClass('small')).toBe('text-sm');
      expect(getFontSizeClass('medium')).toBe('text-base');
      expect(getFontSizeClass('large')).toBe('text-lg');
      expect(getFontSizeClass('extra-large')).toBe('text-xl');
    });

    test('returns default for invalid size', () => {
      expect(getFontSizeClass('invalid' as any)).toBe('text-base');
    });
  });
});