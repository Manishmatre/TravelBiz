import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEME_KEY = 'theme-mode';
const COLOR_KEY = 'color-theme';

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'dark';
  });
  const [color, setColor] = useState(() => {
    return localStorage.getItem(COLOR_KEY) || 'primary';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dataset.themeColor = color;
    localStorage.setItem(COLOR_KEY, color);
  }, [color]);

  const toggleDarkMode = () => setDarkMode((d) => !d);
  const switchColor = (c) => setColor(c);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, color, switchColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 