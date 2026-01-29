import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors } from '../style/appStyles';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 12 }}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Text style={styles.title}>CashFlow</Text>
          </View>

          <View style={styles.card}>
            <View style={{ marginBottom: 12 }}>
              <Button title="Log in" onPress={() => navigation.navigate('Login')} />
            </View>
            <Button title="Sign up" variant="ghost" onPress={() => navigation.navigate('SignUp')} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
