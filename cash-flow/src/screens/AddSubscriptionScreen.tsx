import { useState, useContext } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles, spacing } from '../style/appStyles';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { addSubscription } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import { CURRENCIES } from '../utils/currency';

type BillingCycle = 'weekly' | 'monthly' | 'yearly';

const BILLING_CYCLES: { id: BillingCycle; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function AddSubscriptionScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { currency } = useCurrency();
  const navigation = useNavigation();
  const colors = getColors(theme);
  const appStyles = getAppStyles(colors);
  const styles = createStyles(colors);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!session?.userId) {
      Alert.alert('Error', 'Please sign in to add subscriptions');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Invalid Name', 'Please enter a subscription name');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      await addSubscription(session.userId, {
        name: name.trim(),
        amount: numAmount,
        billingCycle,
        nextBillingDate: nextBillingDate.trim() || undefined,
      });
      Alert.alert('Success', 'Subscription added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save subscription');
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
        <Text style={appStyles.title}>Add Subscription</Text>
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
            {/* Name Input */}
            <Input
              label="Subscription Name"
              value={name}
              onChangeText={setName}
              placeholder="Netflix, Spotify, Gym..."
              autoCapitalize="words"
            />

            {/* Amount Input */}
            <Text style={[styles.sectionTitle, styles.sectionMargin]}>Amount</Text>
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

            {/* Billing Cycle Selection */}
            <Text style={[styles.sectionTitle, styles.sectionMargin]}>Billing Cycle</Text>
            <View style={styles.cycleGrid}>
              {BILLING_CYCLES.map((cycle) => (
                <Pressable
                  key={cycle.id}
                  style={[
                    styles.cycleChip,
                    billingCycle === cycle.id && styles.cycleChipSelected,
                  ]}
                  onPress={() => setBillingCycle(cycle.id)}
                >
                  <Text
                    style={[
                      styles.cycleText,
                      billingCycle === cycle.id && styles.cycleTextSelected,
                    ]}
                  >
                    {cycle.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Next Billing Date */}
            <View style={styles.sectionMargin}>
              <Input
                label="Next Billing Date (optional)"
                value={nextBillingDate}
                onChangeText={setNextBillingDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Save Subscription"
              onPress={handleSave}
              disabled={loading || !name || !amount}
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
    cycleGrid: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    cycleChip: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    cycleChipSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + '20',
    },
    cycleText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    cycleTextSelected: {
      color: colors.accent,
    },
    buttonContainer: {
      marginTop: spacing.lg,
    },
  });
}
