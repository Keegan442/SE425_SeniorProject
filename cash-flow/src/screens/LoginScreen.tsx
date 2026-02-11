import { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors } from '../style/appStyles';

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const { theme } = useTheme();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  function onSubmit() {
    if (busy) return;
    
    setBusy(true);
    signIn(identifier, password)
      .then(() => {
        // Navigation will automatically switch to AppStack when session is set
        setBusy(false);
      })
      .catch((e) => {
        // Ensure we always have a valid error message string
        let errorMessage = 'Try again.';
        if (e instanceof Error && e.message) {
          errorMessage = e.message;
        } else if (typeof e === 'string') {
          errorMessage = e;
        }
        Alert.alert('Login failed', errorMessage);
        setBusy(false);
      });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.screen, { paddingTop: 18 }]}>
        <View style={{ alignItems: 'center', marginTop: 6, marginBottom: 10 }}>
          <Text style={styles.title}>CashFlow</Text>
        </View>

        <View style={styles.card}>
          <View style={{ marginBottom: 12 }}>
            <Input label="Email or Username" value={identifier} onChangeText={setIdentifier} placeholder="" keyboardType="email-address" />
          </View>
          <View style={{ marginBottom: 12 }}>
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="" secureTextEntry />
          </View>

          <View style={styles.spacerSm} />
          <Button title="Login" onPress={onSubmit} disabled={busy} loading={busy} />
          <View style={styles.spacerSm} />
          <Button title="Create account" variant="outline" onPress={() => navigation.navigate('SignUp')} disabled={busy} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
