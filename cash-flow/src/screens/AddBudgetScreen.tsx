import { useState, useEffect, useContext } from 'react';
import {View, Text, Pressable, ScrollView, StyleSheet, Alert, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles, spacing } from '../style/appStyles';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { getCategories, saveBudgetLimit, Category } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import { CURRENCIES } from '../utils/currency';

export default function AddBudgetScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { currency } = useCurrency();
  const navigation = useNavigation();
  const colors = getColors(theme);
  const appStyles = getAppStyles(colors);
  const styles = createStyles(colors);

  const [limit, setLimit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

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
      Alert.alert('Error', 'Please sign in to set budgets');
      return;
    }

    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget limit greater than 0');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category for this budget');
      return;
    }

    try {
      setLoading(true);
      await saveBudgetLimit(session.userId, selectedCategory, numLimit);
      Alert.alert('Success', 'Budget limit set successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
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
        <Text style={appStyles.title}>Set Budget</Text>
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
            {/* Category Selection */}
            <Text style={styles.sectionTitle}>Category</Text>
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

            {/* Budget Limit Input */}
            <Text style={[styles.sectionTitle, styles.sectionMargin]}>Monthly Limit</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>{CURRENCIES[currency] || '$'}</Text>
              <View style={styles.amountInputWrap}>
                <Input
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Save Budget"
              onPress={handleSave}
              disabled={loading || !limit || !selectedCategory}
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
    buttonContainer: {
      marginTop: spacing.lg,
    },
  });
}
