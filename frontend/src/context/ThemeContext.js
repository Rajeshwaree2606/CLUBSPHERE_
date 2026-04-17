import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../utils/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(getTheme(false));

  // Load theme preference from storage on startup
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
          const isDark = JSON.parse(savedTheme);
          setIsDarkMode(isDark);
          setTheme(getTheme(isDark));
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDarkMode;
      setIsDarkMode(newIsDark);
      setTheme(getTheme(newIsDark));
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newIsDark));
    } catch (e) {
      console.error('Failed to toggle theme', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
