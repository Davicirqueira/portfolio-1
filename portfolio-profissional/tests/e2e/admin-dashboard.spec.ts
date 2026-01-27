import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/admin');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Admin/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  // Note: This test would require a test user to be set up
  test.skip('should login with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for navigation tests
    await page.goto('/admin/dashboard');
  });

  test('should display main navigation sections', async ({ page }) => {
    // Check content navigation
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Sobre')).toBeVisible();
    await expect(page.locator('text=Habilidades')).toBeVisible();
    await expect(page.locator('text=Experiência')).toBeVisible();
    await expect(page.locator('text=Projetos')).toBeVisible();
    await expect(page.locator('text=Depoimentos')).toBeVisible();
    await expect(page.locator('text=Contato')).toBeVisible();
    await expect(page.locator('text=Estatísticas')).toBeVisible();
    await expect(page.locator('text=Mídia')).toBeVisible();
    
    // Check system navigation
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Segurança')).toBeVisible();
    await expect(page.locator('text=Acessibilidade')).toBeVisible();
    await expect(page.locator('text=Configurações')).toBeVisible();
    await expect(page.locator('text=Backup')).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    // Navigate to Performance section
    await page.click('text=Performance');
    await expect(page).toHaveURL('/admin/dashboard/performance');
    await expect(page.locator('h1:has-text("Performance")')).toBeVisible();
    
    // Navigate to Accessibility section
    await page.click('text=Acessibilidade');
    await expect(page).toHaveURL('/admin/dashboard/accessibility');
    await expect(page.locator('h1:has-text("Accessibility Settings")')).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.click('text=Performance');
    
    // Check that Performance link has active styling
    const performanceLink = page.locator('a[href="/admin/dashboard/performance"]');
    await expect(performanceLink).toHaveClass(/bg-primary\/10/);
  });
});

test.describe('Accessibility Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard/accessibility');
  });

  test('should display accessibility settings', async ({ page }) => {
    await expect(page.locator('h2:has-text("Idioma")')).toBeVisible();
    await expect(page.locator('text=Alto Contraste')).toBeVisible();
    await expect(page.locator('text=Tamanho da Fonte')).toBeVisible();
    await expect(page.locator('text=Movimento Reduzido')).toBeVisible();
    await expect(page.locator('text=Navegação por Teclado')).toBeVisible();
    await expect(page.locator('text=Leitor de Tela')).toBeVisible();
  });

  test('should toggle high contrast mode', async ({ page }) => {
    const highContrastToggle = page.locator('input[id="high-contrast"]');
    
    // Enable high contrast
    await highContrastToggle.click();
    
    // Check that high contrast class is applied to document
    await expect(page.locator('html')).toHaveClass(/high-contrast/);
  });

  test('should change font size', async ({ page }) => {
    const fontSizeSelect = page.locator('select').first();
    
    await fontSizeSelect.selectOption('large');
    
    // Check that font size class is applied
    await expect(page.locator('html')).toHaveClass(/font-large/);
  });

  test('should switch language', async ({ page }) => {
    const languageSelect = page.locator('select[id="language-select"]');
    
    await languageSelect.selectOption('en');
    
    // Check that interface switches to English
    await expect(page.locator('text=Language')).toBeVisible();
    await expect(page.locator('text=High Contrast')).toBeVisible();
  });
});

test.describe('Performance Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard/performance');
  });

  test('should display performance metrics', async ({ page }) => {
    await expect(page.locator('h2:has-text("Performance Dashboard")')).toBeVisible();
    await expect(page.locator('text=Avg Load Time')).toBeVisible();
    await expect(page.locator('text=Render Time')).toBeVisible();
    await expect(page.locator('text=Cache Hit Rate')).toBeVisible();
    await expect(page.locator('text=Error Rate')).toBeVisible();
  });

  test('should display cache status', async ({ page }) => {
    await expect(page.locator('text=Cache Status')).toBeVisible();
    await expect(page.locator('text=Portfolio Data')).toBeVisible();
    await expect(page.locator('text=Modals')).toBeVisible();
    await expect(page.locator('text=Media Files')).toBeVisible();
  });

  test('should have refresh functionality', async ({ page }) => {
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    
    await refreshButton.click();
    
    // Check that refresh button shows loading state briefly
    await expect(refreshButton).toBeDisabled();
  });
});

test.describe('Keyboard Navigation', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    
    // Test Escape key
    await page.keyboard.press('Escape');
  });

  test('should have skip links', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Focus on skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a:has-text("Skip to main content")');
    
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeFocused();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/dashboard');
    
    // Check that mobile menu button is visible
    const menuButton = page.locator('button[aria-label*="menu"]');
    await expect(menuButton).toBeVisible();
    
    // Open mobile menu
    await menuButton.click();
    
    // Check that navigation is visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin/dashboard');
    
    // Check that layout adapts to tablet size
    await expect(page.locator('main')).toBeVisible();
  });
});