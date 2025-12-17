export function ThemeScript() {
  const themeScript = `
    (function() {
      function getStoredTheme() {
        try {
          return localStorage.getItem('portfolio-theme');
        } catch (e) {
          return null;
        }
      }
      
      function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      function getEffectiveTheme(theme) {
        if (theme === 'system' || !theme) {
          return getSystemTheme();
        }
        return theme;
      }
      
      function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.setAttribute('data-theme', 'dark');
        } else {
          root.removeAttribute('data-theme');
        }
      }
      
      // Apply theme immediately to prevent flash
      const storedTheme = getStoredTheme() || 'system';
      const effectiveTheme = getEffectiveTheme(storedTheme);
      applyTheme(effectiveTheme);
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}