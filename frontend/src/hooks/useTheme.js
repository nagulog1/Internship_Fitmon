import { useCallback, useState } from 'react';

const STORAGE_KEY = 'fitmon-theme';
const THEME_COLORS = { light: '#eceeed', dark: '#111316' };

// index.html sets data-theme before first paint, so this only has to read it back.
export default function useTheme() {
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));

  const toggleTheme = useCallback(() => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[next]);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private windows can block storage. The switch still works until the page reloads.
    }
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}
