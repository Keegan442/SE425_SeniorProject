import { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
  const appStyles = getAppStyles(colors);
  const styles = createStyles(colors);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(isoDate());

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
        dateIso: date,
      });

      Alert.alert('Success', 'Transaction added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
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
        <Text style={appStyles.title}>Add Transaction</Text>
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

            {/* Category Selection */}
            <Text style={[styles.sectionTitle, styles.sectionMargin]}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.id && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Date Input */}
            <View style={styles.sectionMargin}>
              <Input
                label="Date"
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Note Input */}
            <View style={styles.fieldMargin}>
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
          <View style={styles.buttonContainer}>
            <Button
              title="Save Transaction"
              onPress={handleSave}
              disabled={loading || !amount || !selectedCategory}
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
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryChip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    categoryChipSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + '20',
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    categoryTextSelected: {
      color: colors.accent,
    },
    fieldMargin: {
      marginTop: spacing.lg,
    },
    buttonContainer: {
      marginTop: spacing.lg,
    },
  });
}
