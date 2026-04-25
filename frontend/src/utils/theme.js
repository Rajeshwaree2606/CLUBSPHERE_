import { Platform } from 'react-native';

// ─── CLUBSPHERE v3 — "DEEP NAVY SAAS" ──────────────────────────────────────
// Inspired by OnlyTool / Growify references: deep navy + indigo + cyan palette

export const COLORS = {
  // ── Brand Blues / Indigo
  indigo:       '#4F6EF7',
  indigoLight:  '#7B93FF',
  indigoDim:    '#2A3F9E',
  indigoGlow:   'rgba(79,110,247,0.18)',

  purple:       '#7C3AED',
  purpleLight:  '#A855F7',
  purpleGlow:   'rgba(124,58,237,0.15)',

  cyan:         '#06B6D4',
  cyanLight:    '#22D3EE',
  cyanGlow:     'rgba(6,182,212,0.15)',

  cobalt:       '#2563EB',
  cobaltLight:  '#3B82F6',
  cobaltGlow:   'rgba(37,99,235,0.15)',

  // ── Accent Gold (used sparingly)
  gold:         '#F59E0B',
  goldLight:    '#FCD34D',
  goldGlow:     'rgba(245,158,11,0.15)',
  goldDim:      '#92400E',

  // ── Status
  success:      '#10B981',
  successGlow:  'rgba(16,185,129,0.15)',
  warning:      '#F59E0B',
  warningGlow:  'rgba(245,158,11,0.15)',
  error:        '#EF4444',
  errorGlow:    'rgba(239,68,68,0.15)',

  // ── Deep navy surfaces (matching reference images)
  bg:           '#070C18',
  bgCard:       '#0D1526',
  bgElevated:   '#131E33',
  bgModal:      '#0A1220',
  bgSurface:    '#1A2540',

  // ── Text
  textPrimary:  '#E2E8F0',
  textSecond:   '#94A3B8',
  textMuted:    '#475569',

  // ── Borders
  border:       '#1E2D45',
  borderGlow:   'rgba(79,110,247,0.3)',

  // ── Crimson (admin accent)
  crimson:      '#DC2626',
  crimsonLight: '#EF4444',
  crimsonGlow:  'rgba(220,38,38,0.15)',

  white:        '#FFFFFF',
  black:        '#000000',
  transparent:  'transparent',
};

export const GRADIENTS = {
  // Primary CTA
  indigo:       ['#4F6EF7', '#2A3F9E'],
  indigoReverse:['#7B93FF', '#4F6EF7'],

  // Secondary
  purple:       ['#7C3AED', '#4C1D95'],
  purpleCyan:   ['#7C3AED', '#06B6D4'],
  cyan:         ['#06B6D4', '#0284C7'],

  // Gold accent  
  gold:         ['#F59E0B', '#D97706'],
  goldSheen:    ['rgba(245,158,11,0)', 'rgba(245,158,11,0.1)', 'rgba(245,158,11,0)'],

  // Hero gradients
  hero:         ['#070C18', '#0D1A2E', '#070C18'],
  heroBlue:     ['#0D1526', '#0F1F3D', '#070C18'],
  card:         ['#0D1526', '#131E33'],
  dark:         ['#131E33', '#070C18'],
  darkCard:     ['#1A2540', '#0D1526'],

  // Stat card accents
  indigoCard:   ['rgba(79,110,247,0.15)', 'rgba(79,110,247,0.03)'],
  purpleCard:   ['rgba(124,58,237,0.15)', 'rgba(124,58,237,0.03)'],
  cyanCard:     ['rgba(6,182,212,0.15)', 'rgba(6,182,212,0.03)'],
  greenCard:    ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.03)'],
  crimson:      ['#DC2626', '#991B1B'],
  // Legacy / convenience aliases
  cobalt:       ['#2563EB', '#1A3A6B'],   // kept for backward-compat
  cobaltLight:  ['#3B82F6', '#2563EB'],
  success:      ['#10B981', '#065F46'],
  goldReverse:  ['#D97706', '#F59E0B'],
  surface:      ['rgba(13,21,38,0.98)', 'rgba(10,18,32,0.99)'],
};

export const SHADOWS = {
  indigo: Platform.select({
    web:     { boxShadow: '0 0 24px rgba(79,110,247,0.3), 0 4px 16px rgba(0,0,0,0.6)' },
    default: { shadowColor: '#4F6EF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  }),
  gold: Platform.select({
    web:     { boxShadow: '0 0 20px rgba(245,158,11,0.3), 0 4px 12px rgba(0,0,0,0.5)' },
    default: { shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  }),
  card: Platform.select({
    web:     { boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  }),
  medium: Platform.select({
    web:     { boxShadow: '0 4px 16px rgba(0,0,0,0.5)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  }),
  small: Platform.select({
    web:     { boxShadow: '0 2px 8px rgba(0,0,0,0.4)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
  }),
  modal: Platform.select({
    web:     { boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(79,110,247,0.2)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.8, shadowRadius: 24, elevation: 20 },
  }),
  glow: Platform.select({
    web:     { boxShadow: '0 0 40px rgba(79,110,247,0.25)' },
    default: { shadowColor: '#4F6EF7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 0 },
  }),
  subtle: Platform.select({
    web:     { boxShadow: '0 1px 4px rgba(0,0,0,0.5)' },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2 },
  }),
};

export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium:  { fontFamily: 'System', fontWeight: '500' },
  bold:    { fontFamily: 'System', fontWeight: '700' },
  heavy:   { fontFamily: 'System', fontWeight: '900' },
};

export const RADIUS = {
  xs: 6, s: 10, m: 14, l: 20, xl: 28, pill: 100,
};

export const SPACING = {
  xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48,
};

export const TYPOGRAPHY = {
  display: { fontSize: 48, fontWeight: '800', letterSpacing: -1.5, lineHeight: 56 },
  h1:  { fontSize: 36, fontWeight: '800', letterSpacing: -1,   lineHeight: 44 },
  h2:  { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, lineHeight: 36 },
  h3:  { fontSize: 20, fontWeight: '600', letterSpacing: -0.3, lineHeight: 28 },
  h4:  { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  small:{ fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption:{ fontSize: 11, fontWeight: '500', lineHeight: 16, letterSpacing: 0.3 },
  label:  { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
};

// Legacy-compatible theme export
export const getTheme = (isDark = true) => ({
  colors: {
    primary:      COLORS.indigo,
    primaryLight: COLORS.indigoGlow,
    secondary:    COLORS.success,
    secondaryLight: COLORS.successGlow,
    accent:       COLORS.cyan,
    accentLight:  COLORS.cyanGlow,
    success:      COLORS.success,
    successLight: COLORS.successGlow,
    warning:      COLORS.warning,
    warningLight: COLORS.warningGlow,
    background:   COLORS.bg,
    surface:      COLORS.bgCard,
    text:         COLORS.textPrimary,
    textSecondary:COLORS.textSecond,
    border:       COLORS.border,
    error:        COLORS.error,
    errorLight:   COLORS.errorGlow,
    inactive:     COLORS.textMuted,
  },
  spacing: SPACING,
  borderRadius: { s: RADIUS.s, m: RADIUS.m, l: RADIUS.l, xl: RADIUS.xl },
  typography: {
    h1:      { ...TYPOGRAPHY.h1,      color: COLORS.textPrimary },
    h2:      { ...TYPOGRAPHY.h2,      color: COLORS.textPrimary },
    h3:      { ...TYPOGRAPHY.h3,      color: COLORS.textPrimary },
    body:    { ...TYPOGRAPHY.body,    color: COLORS.textPrimary },
    small:   { ...TYPOGRAPHY.small,   color: COLORS.textSecond },
    caption: { ...TYPOGRAPHY.caption, color: COLORS.textSecond },
  },
  shadows: SHADOWS,
  isDark: true,
});

export const theme = getTheme(true);
