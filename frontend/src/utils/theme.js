import { Platform } from 'react-native';

// Light Mode Theme (Professional Indigo/Slate)
export const lightTheme = {
  colors: {
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#818CF8', // Indigo 400
    secondary: '#0EA5E9', // Sky Blue 500
    secondaryLight: '#7DD3FC', // Sky Blue 300
    accent: '#F3F4F6', // Gray 100
    accentLight: '#FFFFFF',
    background: '#F9FAFB', // Gray 50
    surface: '#FFFFFF', // White cards
    text: '#111827', // Gray 900
    textSecondary: '#6B7280', // Gray 500
    error: '#EF4444', // Red 500
    errorLight: '#FCA5A5',
    border: '#E5E7EB',
    inactive: '#D1D5DB',
    divider: '#F3F4F6',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40
  },
  borderRadius: {
    s: 8,
    m: 12, // Reduced from 16 for a more structured look
    l: 16, // Reduced from 24
    round: 9999
  },
  shadows: {
    small: {
      shadowColor: '#111827',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#111827',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    }
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700', color: '#111827', letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600', color: '#111827' },
    body: { fontSize: 16, color: '#111827', lineHeight: 24 },
    caption: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
    small: { fontSize: 12, color: '#9CA3AF' },
  }
};

// Dark Mode Theme (Professional Slate)
export const darkTheme = {
  colors: {
    primary: '#6366F1', // Indigo 500
    primaryLight: '#818CF8', // Indigo 400
    secondary: '#38BDF8', // Sky Blue 400
    secondaryLight: '#7DD3FC', // Sky Blue 300
    accent: '#374151', // Gray 700
    accentLight: '#4B5563',
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    error: '#EF4444', 
    errorLight: '#FCA5A5',
    border: '#334155', // Slate 700
    inactive: '#475569',
    divider: '#334155',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    round: 9999
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    }
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600', color: '#F8FAFC' },
    body: { fontSize: 16, color: '#F8FAFC', lineHeight: 24 },
    caption: { fontSize: 14, color: '#94A3B8', lineHeight: 20 },
    small: { fontSize: 12, color: '#64748B' },
  }
};

// Default export (light theme)
export const theme = lightTheme;

// Helper function to get theme
export const getTheme = (isDarkMode) => isDarkMode ? darkTheme : lightTheme;
