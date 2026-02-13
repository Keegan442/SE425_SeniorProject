import { StyleSheet, Text, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors } from '../style/appStyles';

export default function ModalScreen() {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const navigation = useNavigation();

  return (
    <View style={[modalStyles.container, styles.safe]}>
      <Text style={styles.title}>This is a modal</Text>
      <Pressable onPress={() => navigation.goBack()} style={modalStyles.link}>
        <Text style={styles.muted}>Go to home screen</Text>
      </Pressable>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
