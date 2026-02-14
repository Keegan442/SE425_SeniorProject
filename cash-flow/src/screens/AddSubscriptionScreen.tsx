import { useState, useContext } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles, spacing } from '../style/appStyles';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { addSubscription } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import { CURRENCIES } from '../utils/currency';
import { isoDate } from '../utils/date';

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
  const styles = getAppStyles(colors);
  const local = createLocalStyles(colors);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setNextBillingDate(selected);
  };

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
        nextBillingDate: nextBillingDate ? isoDate(nextBillingDate) : undefined,
      });
      Alert.alert('Success', 'Subscription added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to save subscription:', error);
      Alert.alert('Error', 'Failed to save subscription');
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
        <Text style={styles.title}>Add Subscription</Text>
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
            {/* Name Input */}
            <Input
              label="Subscription Name"
              value={name}
              onChangeText={setName}
              placeholder="Netflix, Spotify, Gym..."
              autoCapitalize="words"
            />

            {/* Amount Input */}
            <Text style={[styles.formSectionTitle, styles.formSectionMargin]}>Amount</Text>
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

            {/* Billing Cycle Selection */}
            <Text style={[styles.formSectionTitle, styles.formSectionMargin]}>Billing Cycle</Text>
            <View style={local.cycleGrid}>
              {BILLING_CYCLES.map((cycle) => (
                <Pressable
                  key={cycle.id}
                  style={[
                    local.cycleChip,
                    billingCycle === cycle.id && local.cycleChipSelected,
                  ]}
                  onPress={() => setBillingCycle(cycle.id)}
                >
                  <Text
                    style={[
                      local.cycleText,
                      billingCycle === cycle.id && local.cycleTextSelected,
                    ]}
                  >
                    {cycle.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Next Billing Date */}
            <View style={styles.formSectionMargin}>
              <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                Next Billing Date 
              </Text>
              <Pressable
                onPress={() => {
                  if (!nextBillingDate) setNextBillingDate(new Date());
                  setShowDatePicker(!showDatePicker);
                }}
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  paddingVertical: 12,
                  paddingHorizontal: spacing.md,
                  borderRadius: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: nextBillingDate ? colors.text : colors.muted, fontSize: 16 }}>
                  {nextBillingDate ? nextBillingDate.toLocaleDateString() : 'Tap to select date'}
                </Text>
                {nextBillingDate && (
                  <Pressable
                    onPress={() => {
                      setNextBillingDate(null);
                      setShowDatePicker(false);
                    }}
                    hitSlop={8}
                  >
                    <Text style={{ color: colors.muted, fontSize: 16 }}>✕</Text>
                  </Pressable>
                )}
              </Pressable>
              {showDatePicker && nextBillingDate && (
                <DateTimePicker
                  value={nextBillingDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.formButtonContainer}>
            <Button
              title="Save Subscription"
              onPress={handleSave}
              disabled={loading || !name || !amount}
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

function createLocalStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
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
  });
}
