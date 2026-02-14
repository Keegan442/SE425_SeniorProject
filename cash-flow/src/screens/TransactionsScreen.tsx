import { useState, useContext, useCallback, useMemo } from 'react';
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
import { monthKey } from '../utils/date';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatMonthLabel(mKey: string): string {
  const [year, month] = mKey.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

function shiftMonth(mKey: string, offset: number): string {
  const [year, month] = mKey.split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatDateLabel(dateIso: string): string {
  const [year, month, day] = dateIso.split('-');
  const monthName = MONTH_NAMES[parseInt(month, 10) - 1];
  return `${monthName} ${parseInt(day, 10)}, ${year}`;
}

export default function TransactionsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const localStyles = createLocalStyles(colors);
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(monthKey());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadTransactions = useCallback(async () => {
    if (!session?.userId) return;
    try {
      const { month } = await getMonthData(session.userId, selectedMonth);
      setExpenses(month.expenses || []);
      setCategories(month.categories || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, [session?.userId, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  function getCategoryName(categoryId: string): string {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  const isCurrentMonth = selectedMonth === monthKey();

  // Group expenses by date, sorted newest first
  const groupedExpenses = useMemo(() => {
    const sorted = [...expenses].sort((a, b) =>
      new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
    );

    const groups: { date: string; items: Expense[] }[] = [];
    for (const expense of sorted) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === expense.dateIso) {
        lastGroup.items.push(expense);
      } else {
        groups.push({ date: expense.dateIso, items: [expense] });
      }
    }
    return groups;
  }, [expenses]);

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

        {/* Month Selector */}
        <View style={localStyles.monthSelector}>
          <Pressable onPress={() => setSelectedMonth(shiftMonth(selectedMonth, -1))} style={localStyles.monthArrow}>
            <Text style={localStyles.monthArrowText}>{'<'}</Text>
          </Pressable>
          <Pressable onPress={() => setSelectedMonth(monthKey())} style={localStyles.monthLabelWrap}>
            <Text style={localStyles.monthLabel}>{formatMonthLabel(selectedMonth)}</Text>
          </Pressable>
          <Pressable
            onPress={() => !isCurrentMonth && setSelectedMonth(shiftMonth(selectedMonth, 1))}
            style={localStyles.monthArrow}
            disabled={isCurrentMonth}
          >
            <Text style={[localStyles.monthArrowText, isCurrentMonth && { opacity: 0.3 }]}>{'>'}</Text>
          </Pressable>
        </View>

        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContentBottom} showsVerticalScrollIndicator={false}>
            {groupedExpenses.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.h2}>Transactions</Text>
                <Text style={[styles.muted, styles.marginTopMd]}>No transactions for {formatMonthLabel(selectedMonth)}</Text>
              </View>
            ) : (
              groupedExpenses.map((group) => (
                <View key={group.date} style={{ marginBottom: spacing.md }}>
                  <Text style={localStyles.dateHeader}>{formatDateLabel(group.date)}</Text>
                  <View style={styles.card}>
                    {group.items.map((expense) => (
                      <View key={expense.id} style={localStyles.transactionItem}>
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
                </View>
              ))
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
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    monthArrow: {
      padding: spacing.sm,
    },
    monthArrowText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.accent,
    },
    monthLabelWrap: {
      flex: 1,
      alignItems: 'center',
    },
    monthLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    dateHeader: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
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
    },
    transactionNote: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 2,
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
