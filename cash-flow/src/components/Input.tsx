import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';
import { spacing, getColors } from '../style/appStyles';
import { useTheme } from '../theme/ThemeContext';

interface Colors {
  muted: string;
  card: string;
  border: string;
  text: string;
}

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

const createInputStyles = (colors: Colors) => StyleSheet.create({
  wrap: { },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    fontSize: 16,
  },
});

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize = 'none' }: InputProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const styles = createInputStyles(colors);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || ''}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}
