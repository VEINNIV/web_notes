import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'noteflow_theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return getSystemTheme();
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  const applyTheme = useCallback((t) => {
    document.documentElement.setAttribute('data-theme', t);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', t === 'dark' ? '#1a1714' : '#faf8f5');
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const sys = mql.matches ? 'dark' : 'light';
        setThemeState(sys);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
