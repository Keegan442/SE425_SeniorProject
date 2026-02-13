import { Pressable, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { spacing, getColors } from '../style/appStyles';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'ghost' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

interface Colors {
  accent: string;
  ok: string;
  card: string;
  border: string;
  danger: string;
  white: string;
  text: string;
}

const createButtonStyles = (colors: Colors) => StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  success: {
    backgroundColor: colors.ok,
    borderColor: colors.ok,
  },
  ghost: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textGhost: {
    color: colors.text,
    fontWeight: '600',
  },
  textOutline: {
    color: colors.accent,
    fontWeight: '600',
  },
});

export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false }: ButtonProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const styles = createButtonStyles(colors);

  // Ensure title is always a string
  const displayTitle = typeof title === 'string' ? title : String(title || '');

  const handlePress = () => {
    if (disabled || loading) return;
    try {
      onPress();
    } catch (error) {
      // Prevent errors from being rendered as strings
      console.error('Button onPress error:', error);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'success' && styles.success,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'ghost' || variant === 'outline' ? colors.accent : colors.white} 
        />
      ) : (
        <Text style={[
          styles.text, 
          variant === 'ghost' && styles.textGhost,
          variant === 'outline' && styles.textOutline,
        ]}>
          {displayTitle}
        </Text>
      )}
    </Pressable>
  );
}
