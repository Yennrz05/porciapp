import { useEffect, useState } from 'react';

const THEME_KEY = 'porciapp_theme_v2';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage no disponible
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // localStorage no disponible
      }
      return next;
    });
  };

  return { theme, toggleTheme };
}

export type ThemeHook = ReturnType<typeof useTheme>;
