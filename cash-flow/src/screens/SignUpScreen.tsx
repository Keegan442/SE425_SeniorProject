import { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors } from '../style/appStyles';

function formatBirthday(text: string) {
  const digits = text.replace(/\D/g, '');

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export default function SignUpScreen() {
  const { signUp } = useContext(AuthContext);
  const { theme } = useTheme();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reEnter, setReEnter] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [busy, setBusy] = useState(false);

  function onSubmit() {
    if (busy) return;
    
    if (password !== reEnter) {
      Alert.alert('Sign up', 'Passwords do not match.');
      return;
    }
    
    setBusy(true);
    signUp(
      email,
      password,
      username,
      firstName,
      lastName,
      birthday
    )
      .then(() => {
        // Navigation will automatically switch to AppStack when session is set
        setBusy(false);
      })
      .catch((e) => {
        const errorMessage = e instanceof Error ? e.message : 'Try again.';
        Alert.alert('Sign up failed', errorMessage);
        setBusy(false);
      });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.screen}>
          <View style={{ alignItems: 'center', marginTop: 22, marginBottom: 8 }}>
            <Text style={styles.title}>CashFlow</Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 12 }}>
              <Input label="Username" value={username} onChangeText={setUsername} placeholder="" autoCapitalize="none" />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Input label="First Name" value={firstName} onChangeText={setFirstName} placeholder="" autoCapitalize="words" />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Input label="Last Name" value={lastName} onChangeText={setLastName} placeholder="" autoCapitalize="words" />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Input label="Birthday" value={birthday} onChangeText={(text) => setBirthday(formatBirthday(text))} placeholder="MM/DD/YYYY" keyboardType="numeric" />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="" keyboardType="email-address" />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="" secureTextEntry />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Input label="Re-enter password" value={reEnter} onChangeText={setReEnter} placeholder="" secureTextEntry />
            </View>
          </ScrollView>

          <View style={{ marginTop: 6 }}>
            <View style={{ marginBottom: 10 }}>
              <Button title="Register" variant="success" onPress={onSubmit} disabled={busy} loading={busy} />
            </View>
            <Button title="Back" variant="outline" onPress={() => navigation.goBack()} disabled={busy} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
