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

    // Screen header (burger, title, theme toggle)
    screenHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: 8,
      paddingBottom: 4,
    },
    headerRightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    themeToggleButton: {
      padding: spacing.xs,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: { padding: spacing.xs, minWidth: 32 },
    logoImage: { width: 44, height: 44 },

    // Scroll
    scrollContentBottom: { paddingBottom: spacing.lg },

    // Spacing
    marginTopSm: { marginTop: spacing.sm },
    marginTopMd: { marginTop: spacing.md },
    marginTopPill: { marginTop: 6 },
    formFieldMargin: { marginTop: spacing.md },
    labelMarginBottom: { marginBottom: 8 },

    // Center blocks
    centerBlock: { alignItems: 'center' },
    centerBlockMargin: { alignItems: 'center', marginBottom: spacing.lg },
    centerBlockMarginTop: { marginTop: spacing.md, alignItems: 'center' },
    screenCenter: { justifyContent: 'center', alignItems: 'center' },

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
    pillRight: { marginRight: spacing.md },
    row: { flexDirection: 'row' },
    rowTopSpaced: { flexDirection: 'row', marginTop: spacing.md },
    spacerSm: { height: spacing.sm },

    // Profile / shared
    profileAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: themeColors.card,
      borderWidth: 2,
      borderColor: themeColors.border,
    },
    profileAvatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: themeColors.card,
      borderWidth: 2,
      borderColor: themeColors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    currencyChip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themeColors.border,
      backgroundColor: themeColors.card,
    },
    currencyChipSelected: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themeColors.accent,
      backgroundColor: themeColors.accent + '20',
    },

    // Text Styles
    title: { fontSize: 26, fontWeight: '700', color: themeColors.text },
    h2: { fontSize: 18, fontWeight: '700', color: themeColors.text },
    h2Center: { fontSize: 18, fontWeight: '700', color: themeColors.text, textAlign: 'center' },
    h2Large: { fontSize: 40, fontWeight: '700', color: themeColors.text },
    body: { fontSize: 16, fontWeight: '500', color: themeColors.text },
    bodyTop4: { marginTop: 4 },
    bodyTop4Muted: { marginTop: 4, opacity: 0.6 },
    bodyAccent: { fontSize: 16, fontWeight: '500', color: themeColors.accent },
    bodyMuted: { fontSize: 16, fontWeight: '500', color: themeColors.muted },
    muted: { fontSize: 16, fontWeight: '500', color: themeColors.muted },
    smallMuted: { fontSize: 13, fontWeight: '500', color: themeColors.muted },
    smallMutedTop: { fontSize: 13, fontWeight: '500', color: themeColors.muted, marginTop: spacing.xs },
    footnote: { color: themeColors.muted, fontSize: 12, flex: 1 },
    smallMutedTop2: { fontSize: 13, fontWeight: '500', color: themeColors.muted, marginTop: 2 },
    bigMoney: { fontSize: 44, fontWeight: '800', color: themeColors.text, letterSpacing: -0.5 },
  });
}

// Default styles (dark theme)
export const appStyles = getAppStyles(darkColors);
