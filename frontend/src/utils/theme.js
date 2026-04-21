import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#6366f1',
    primaryLight: '#e0e7ff',
    secondary: '#10b981',
    secondaryLight: '#d1fae5',
    accent: '#f59e0b',
    accentLight: '#fef3c7',
    success: '#22c55e',
    successLight: '#dcfce7',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    errorLight: '#fee2e2',
    inactive: '#9ca3af',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
  },
  typography: {
    h1: {
      fontSize: 40,
      fontWeight: 'bold',
      lineHeight: 48,
    },
    h2: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: '#1f2937',
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
  shadows: {
    small: Platform.select({
      web: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
    medium: Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
    large: Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
};

export const getTheme = (isDark = false) => {
  if (isDark) {
    return {
      ...theme,
      colors: {
        ...theme.colors,
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#a1a1aa',
        border: '#333333',
        primaryLight: '#312e81',
        secondaryLight: '#064e3b',
        errorLight: '#7f1d1d',
        successLight: '#14532d',
        warningLight: '#78350f',
        accentLight: '#78350f',
        inactive: '#52525b',
      }
    };
  }
  return theme;
};
