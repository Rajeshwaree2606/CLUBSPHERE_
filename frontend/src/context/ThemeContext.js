import React, { createContext, useState } from 'react';
import { getTheme } from '../utils/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Always dark — premium luxury theme
  const [theme] = useState(getTheme(true));

  return (
    <ThemeContext.Provider value={{ isDarkMode: true, theme, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};
