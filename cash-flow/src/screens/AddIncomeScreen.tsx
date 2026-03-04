import { useState, useContext } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles } from '../style/appStyles';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { updateIncome } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import { CURRENCIES } from '../utils/currency';

export default function AddIncomeScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { currency } = useCurrency();
  const navigation = useNavigation();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!session?.userId) {
      Alert.alert('Error', 'Please sign in to add income');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      await updateIncome(session.userId, numAmount);
      Alert.alert('Success', 'Income updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to save income:', error);
      Alert.alert('Error', 'Failed to save income');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.screenHeaderRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.formBackButton}>
          <Text style={styles.formBackText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add Income</Text>
        <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
          <Image
            source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.formScrollContent}
        >
          <View style={styles.card}>
            {/* Amount Input */}
            <Text style={styles.formSectionTitle}>Amount</Text>
            <View style={styles.formAmountContainer}>
              <Text style={styles.formCurrencySymbol}>{CURRENCIES[currency] || '$'}</Text>
              <View style={styles.formAmountInputWrap}>
                <Input
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

          </View>

          {/* Save Button */}
          <View style={styles.formButtonContainer}>
            <Button
              title="Save Income"
              onPress={handleSave}
              disabled={loading || !amount}
              loading={loading}
              variant="success"
            />
          </View>

          <View style={styles.formButtonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
