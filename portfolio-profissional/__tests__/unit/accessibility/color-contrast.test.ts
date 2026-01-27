import { getContrastRatio, meetsWCAGAA, meetsWCAGAAA } from '@/lib/utils/accessibility';

describe('Color Contrast Validation', () => {
  describe('WCAG AA Compliance', () => {
    test('validates high contrast combinations', () => {
      // Black on white - should pass AA
      expect(meetsWCAGAA('#000000', '#ffffff')).toBe(true);
      
      // White on black - should pass AA
      expect(meetsWCAGAA('#ffffff', '#000000')).toBe(true);
      
      // Dark blue on white - should pass AA
      expect(meetsWCAGAA('#003366', '#ffffff')).toBe(true);
    });

    test('rejects low contrast combinations', () => {
      // Light gray on white - should fail AA
      expect(meetsWCAGAA('#cccccc', '#ffffff')).toBe(false);
      
      // Medium gray on white - should fail AA
      expect(meetsWCAGAA('#999999', '#ffffff')).toBe(false);
      
      // Light blue on white - should fail AA
      expect(meetsWCAGAA('#87ceeb', '#ffffff')).toBe(false);
    });

    test('validates border cases for AA standard', () => {
      // Colors that are right at the AA threshold (4.5:1)
      // These tests verify the boundary conditions
      
      // A combination that should just pass AA
      const justPassesAA = getContrastRatio('#767676', '#ffffff');
      expect(justPassesAA).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAGAA('#767676', '#ffffff')).toBe(true);
      
      // A combination that should just fail AA
      const justFailsAA = getContrastRatio('#777777', '#ffffff');
      expect(justFailsAA).toBeLessThan(4.5);
      expect(meetsWCAGAA('#777777', '#ffffff')).toBe(false);
    });
  });

  describe('WCAG AAA Compliance', () => {
    test('validates very high contrast combinations', () => {
      // Black on white - should pass AAA
      expect(meetsWCAGAAA('#000000', '#ffffff')).toBe(true);
      
      // Very dark colors on white - should pass AAA
      expect(meetsWCAGAAA('#1a1a1a', '#ffffff')).toBe(true);
    });

    test('rejects medium contrast combinations for AAA', () => {
      // Dark gray on white - might pass AA but fail AAA
      expect(meetsWCAGAAA('#666666', '#ffffff')).toBe(false);
      
      // Medium contrast that passes AA but fails AAA
      expect(meetsWCAGAA('#595959', '#ffffff')).toBe(true);
      expect(meetsWCAGAAA('#595959', '#ffffff')).toBe(false);
    });

    test('validates border cases for AAA standard', () => {
      // Colors that are right at the AAA threshold (7:1)
      
      // A combination that should just pass AAA
      const justPassesAAA = getContrastRatio('#595959', '#ffffff');
      expect(justPassesAAA).toBeGreaterThanOrEqual(7);
      expect(meetsWCAGAAA('#595959', '#ffffff')).toBe(true);
      
      // A combination that should just fail AAA
      const justFailsAAA = getContrastRatio('#5a5a5a', '#ffffff');
      expect(justFailsAAA).toBeLessThan(7);
      expect(meetsWCAGAAA('#5a5a5a', '#ffffff')).toBe(false);
    });
  });

  describe('Contrast Ratio Calculations', () => {
    test('calculates correct ratios for known color combinations', () => {
      // Black on white should be 21:1
      const blackOnWhite = getContrastRatio('#000000', '#ffffff');
      expect(blackOnWhite).toBeCloseTo(21, 1);
      
      // Same color should be 1:1
      const sameColor = getContrastRatio('#ff0000', '#ff0000');
      expect(sameColor).toBe(1);
      
      // Medium gray on white should be around 5.74:1
      const mediumGrayOnWhite = getContrastRatio('#757575', '#ffffff');
      expect(mediumGrayOnWhite).toBeCloseTo(4.54, 1);
    });

    test('handles different color formats consistently', () => {
      // Test with different case
      const lowerCase = getContrastRatio('#ffffff', '#000000');
      const upperCase = getContrastRatio('#FFFFFF', '#000000');
      expect(lowerCase).toBe(upperCase);
      
      // Test with 3-digit hex (should be expanded to 6-digit)
      const shortHex = getContrastRatio('#fff', '#000');
      const longHex = getContrastRatio('#ffffff', '#000000');
      expect(shortHex).toBeCloseTo(longHex, 1);
    });

    test('is symmetric (order should not matter)', () => {
      const ratio1 = getContrastRatio('#000000', '#ffffff');
      const ratio2 = getContrastRatio('#ffffff', '#000000');
      expect(ratio1).toBe(ratio2);
    });
  });

  describe('Real-world Color Combinations', () => {
    test('validates common UI color combinations', () => {
      // Primary blue on white (common button color)
      expect(meetsWCAGAA('#0066cc', '#ffffff')).toBe(true);
      
      // Success green on white
      expect(meetsWCAGAA('#28a745', '#ffffff')).toBe(true);
      
      // Danger red on white
      expect(meetsWCAGAA('#dc3545', '#ffffff')).toBe(true);
      
      // Warning orange on white (often problematic)
      expect(meetsWCAGAA('#ffc107', '#ffffff')).toBe(false);
    });

    test('validates dark theme combinations', () => {
      // Light text on dark background
      expect(meetsWCAGAA('#ffffff', '#1a1a1a')).toBe(true);
      expect(meetsWCAGAA('#f8f9fa', '#212529')).toBe(true);
      
      // Medium gray text on dark background
      expect(meetsWCAGAA('#adb5bd', '#212529')).toBe(true);
    });

    test('identifies problematic color combinations', () => {
      // Common problematic combinations
      expect(meetsWCAGAA('#ffff00', '#ffffff')).toBe(false); // Yellow on white
      expect(meetsWCAGAA('#00ff00', '#ffffff')).toBe(false); // Bright green on white
      expect(meetsWCAGAA('#ff00ff', '#ffffff')).toBe(false); // Magenta on white
      expect(meetsWCAGAA('#00ffff', '#ffffff')).toBe(false); // Cyan on white
    });
  });
});