import { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles, spacing } from '../style/appStyles';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { addExpense, getCategories, Category } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import { CURRENCIES } from '../utils/currency';
import { isoDate } from '../utils/date';

export default function AddTransactionScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { currency } = useCurrency();
  const navigation = useNavigation();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setDate(selected);
  };

  useEffect(() => {
    if (session?.userId) {
      loadCategories();
    }
  }, [session?.userId]);

  async function loadCategories() {
    if (!session?.userId) return;
    try {
      const cats = await getCategories(session.userId);
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    }
  }

  async function handleSave() {
    if (!session?.userId) {
      Alert.alert('Error', 'Please sign in to add transactions');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category for this transaction');
      return;
    }

    try {
      setLoading(true);
      await addExpense(session.userId, {
        amount: numAmount,
        categoryId: selectedCategory,
        note: note.trim() || undefined,
        dateIso: isoDate(date),
      });

      Alert.alert('Success', 'Transaction added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
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
        <Text style={styles.title}>Add Transaction</Text>
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

            {/* Category Selection */}
            <Text style={[styles.formSectionTitle, styles.formSectionMargin]}>Category</Text>
            <View style={styles.chipGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.chip,
                    selectedCategory === cat.id && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === cat.id && styles.chipTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Date Picker */}
            <View style={styles.formSectionMargin}>
              <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Date</Text>
              <Pressable
                onPress={() => setShowDatePicker(!showDatePicker)}
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  paddingVertical: 12,
                  paddingHorizontal: spacing.md,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 16 }}>
                  {date.toLocaleDateString()}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* Note Input */}
            <View style={styles.formSectionMargin}>
              <Input
                label="Note (optional)"
                value={note}
                onChangeText={setNote}
                placeholder="What was this for?"
                autoCapitalize="sentences"
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.formButtonContainer}>
            <Button
              title="Save Transaction"
              onPress={handleSave}
              disabled={loading || !amount || !selectedCategory}
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
