import { StyleSheet, TextInput, View } from 'react-native';
import { spacing, getColors } from '../style/appStyles';
import { useTheme } from '../theme/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder ="" }: SearchBarProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    input: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      color: colors.text,
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      fontSize: 15,
    },
  });
}
