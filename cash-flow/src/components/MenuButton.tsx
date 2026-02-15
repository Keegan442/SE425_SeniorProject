import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getColors } from '../style/appStyles';

interface MenuButtonProps {
  onPress: () => void;
}

export function MenuButton({ onPress }: MenuButtonProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <View style={[styles.line, { backgroundColor: colors.text }]} />
      <View style={[styles.line, { backgroundColor: colors.text }]} />
      <View style={[styles.line, { backgroundColor: colors.text }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    justifyContent: 'space-around',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  line: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
});
