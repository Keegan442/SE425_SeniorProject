import { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles } from '../style/appStyles';
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
  const styles = getAppStyles(colors);

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
      Alert.alert('Error', 'Failed to load categories. Please try again.');
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
      console.error('Failed to save budget:', error);
      Alert.alert('Error', 'Failed to save budget');
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
        <Text style={styles.title}>Set Budget</Text>
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
            {/* Category Selection */}
            <Text style={styles.formSectionTitle}>Category</Text>
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

            {/* Budget Limit Input */}
            <Text style={[styles.formSectionTitle, styles.formSectionMargin]}>Monthly Limit</Text>
            <View style={styles.formAmountContainer}>
              <Text style={styles.formCurrencySymbol}>{CURRENCIES[currency] || '$'}</Text>
              <View style={styles.formAmountInputWrap}>
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
          <View style={styles.formButtonContainer}>
            <Button
              title="Save Budget"
              onPress={handleSave}
              disabled={loading || !limit || !selectedCategory}
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

