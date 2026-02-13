import { useState, useContext, useCallback } from 'react';
import { Text, View, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors, spacing } from '../style/appStyles';
import { AuthContext } from '../auth/AuthContext';
import { getMonthData, Expense, Category } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';

export default function TransactionsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const localStyles = createLocalStyles(colors);
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadTransactions = useCallback(async () => {
    if (!session?.userId) return;
    try {
      const { month } = await getMonthData(session.userId);
      setExpenses(month.expenses || []);
      setCategories(month.categories || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, [session?.userId]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  function getCategoryName(categoryId: string): string {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
  );

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screenHeaderRow}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>Transactions</Text>
          <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
            <Image
              source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContentBottom} showsVerticalScrollIndicator={false}>
            {sortedExpenses.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.h2}>Transactions</Text>
                <Text style={[styles.muted, styles.marginTopMd]}>No transactions yet. Add your first one!</Text>
              </View>
            ) : (
              <View style={styles.card}>
                {sortedExpenses.map((expense) => (
                  <View key={expense.id} style={localStyles.transactionItem}>
                    <Text style={localStyles.transactionDate}>{expense.dateIso}</Text>
                    <Text style={localStyles.transactionCategory}>
                      {getCategoryName(expense.categoryId)}
                    </Text>
                    {expense.note ? (
                      <Text style={localStyles.transactionNote} numberOfLines={1}>
                        {expense.note}
                      </Text>
                    ) : null}
                    <Text style={localStyles.transactionAmount}>
                      -{formatAmount(expense.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="+ Add Transaction"
                onPress={() => navigation.navigate('AddTransaction')}
                variant="primary"
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

function createLocalStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    transactionItem: {
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    transactionCategory: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginTop: 4,
    },
    transactionNote: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 2,
    },
    transactionDate: {
      fontSize: 24,
      color: colors.green,
      textAlign: 'center',
    },
    transactionAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.danger,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
}
