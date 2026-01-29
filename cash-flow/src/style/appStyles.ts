import { StyleSheet } from 'react-native';

export interface Colors {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  ok: string;
  accent: string;
  white: string;
}

// Dark theme colors
export const darkColors: Colors = {
  bg: '#0B0D10',
  card: '#12161C',
  text: '#E9EEF5',
  muted: '#A8B2BF',
  border: '#222A35',
  danger: '#E85D5D',
  ok: '#46D39A',
  accent: '#4F8CFF', 
  white: '#FFFFFF',
};

// Light theme colors
export const lightColors: Colors = {
  bg: '#FFFFFF',
  card: '#F5F7FA',
  text: '#1A1F2E',
  muted: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  ok: '#10B981',
  accent: '#4F8CFF',
  white: '#FFFFFF',
};

// Note: Use getColors() function instead of exporting colors directly

// Get colors based on theme
export function getColors(theme: 'light' | 'dark' = 'dark'): Colors {
  return theme === 'light' ? lightColors : darkColors;
}

// Spacing
export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

// Get styles based on theme
export function getAppStyles(themeColors: Colors) {
  return StyleSheet.create({
    // Layout
    safe: { flex: 1, backgroundColor: themeColors.bg },
    screen: { flex: 1, padding: spacing.lg, backgroundColor: themeColors.bg },
    header: { marginTop: spacing.lg },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    pushBottom: { flex: 1 },

    card: {
      borderColor: themeColors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: spacing.lg,
      backgroundColor: 'transparent',
    },
    cardTight: {
      borderColor: themeColors.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: spacing.lg,
      backgroundColor: 'transparent',
    },
    pill: {
      flex: 1,
      backgroundColor: themeColors.card,
      borderColor: themeColors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: spacing.md,
    },
    row: { flexDirection: 'row' },
    rowTopSpaced: { flexDirection: 'row', marginTop: spacing.md },
    spacerSm: { height: spacing.sm },

    // Text Styles
    title: { fontSize: 26, fontWeight: '700', color: themeColors.text },
    h2: { fontSize: 18, fontWeight: '700', color: themeColors.text },
    body: { fontSize: 16, fontWeight: '500', color: themeColors.text },
    muted: { fontSize: 16, fontWeight: '500', color: themeColors.muted },
    smallMuted: { fontSize: 13, fontWeight: '500', color: themeColors.muted },
    footnote: { color: themeColors.muted, fontSize: 12, flex: 1 },
    smallMutedTop2: { fontSize: 13, fontWeight: '500', color: themeColors.muted, marginTop: 2 },
    bigMoney: { fontSize: 44, fontWeight: '800', color: themeColors.text, letterSpacing: -0.5 },
  });
}

// Default styles (dark theme)
export const appStyles = getAppStyles(darkColors);
