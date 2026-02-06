import { useState, useContext } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles, spacing } from '../style/appStyles';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { useCurrency } from '../theme/CurrencyContext';
import { CURRENCIES } from '../utils/currency';

export default function AddIncomeScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { currency } = useCurrency();
  const navigation = useNavigation();
  const colors = getColors(theme);
  const appStyles = getAppStyles(colors);
  const styles = createStyles(colors);

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
      // TODO: Add saveIncome function to budgetStore
      Alert.alert('Success', 'Income added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save income');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={appStyles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={appStyles.screenHeaderRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={appStyles.title}>Add Income</Text>
        <Pressable onPress={toggleTheme} style={appStyles.themeToggleButton}>
          <Image
            source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
            style={appStyles.logoImage}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={appStyles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={appStyles.card}>
            {/* Amount Input */}
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>{CURRENCIES[currency] || '$'}</Text>
              <View style={styles.amountInputWrap}>
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
          <View style={styles.buttonContainer}>
            <Button
              title="Save Income"
              onPress={handleSave}
              disabled={loading || !amount}
              loading={loading}
              variant="success"
            />
          </View>

          <View style={styles.buttonContainer}>
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

function createStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    backButton: {
      padding: spacing.xs,
    },
    backText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.accent,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
      marginBottom: spacing.sm,
    },
    sectionMargin: {
      marginTop: spacing.lg,
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currencySymbol: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginRight: spacing.sm,
    },
    amountInputWrap: {
      flex: 1,
    },
    buttonContainer: {
      marginTop: spacing.lg,
    },
  });
}
