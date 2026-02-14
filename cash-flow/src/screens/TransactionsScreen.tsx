import { useState, useContext, useCallback, useEffect } from 'react';
import { Text, View, Image, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { Button } from '../components/Button';
import { SearchBar } from '../components/SearchBar';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors, spacing } from '../style/appStyles';
import { AuthContext } from '../auth/AuthContext';
import { getMonthData, Expense, Category } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import { monthKey, shiftMonth } from '../utils/date';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatMonthLabel(mKey: string): string {
  const [year, month] = mKey.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
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
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [groupedExpenses, setGroupedExpenses] = useState<{ date: string; items: Expense[] }[]>([]);

  const loadTransactions = useCallback(async () => {
    if (!session?.userId) return;
    try {
      const { month } = await getMonthData(session.userId, selectedMonth);
      setExpenses(month.expenses || []);
      setCategories(month.categories || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please try again.');
    }
  }, [session?.userId, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const getCategoryName = useCallback((categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }, [categories]);
  const isCurrentMonth = selectedMonth === monthKey();

  useEffect(() => {
    let filtered = [...expenses];

    if (filterCategory) {
      filtered = filtered.filter(e => e.categoryId === filterCategory);
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      filtered = filtered.filter(e => {
        const catName = getCategoryName(e.categoryId).toLowerCase();
        const note = (e.note || '').toLowerCase();
        return catName.includes(query) || note.includes(query);
      });
    }

    filtered.sort((a, b) =>
      new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
    );

    const groups: { date: string; items: Expense[] }[] = [];
    for (const expense of filtered) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === expense.dateIso) {
        lastGroup.items.push(expense);
      } else {
        groups.push({ date: expense.dateIso, items: [expense] });
      }
    }
    setGroupedExpenses(groups);
  }, [expenses, filterCategory, searchText, getCategoryName]);

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
        <View style={styles.monthSelector}>
          <Pressable onPress={() => setSelectedMonth(shiftMonth(selectedMonth, -1))} style={styles.monthArrow}>
            <Text style={styles.monthArrowText}>{'<'}</Text>
          </Pressable>
          <Pressable onPress={() => setSelectedMonth(monthKey())} style={styles.monthLabelWrap}>
            <Text style={styles.monthLabel}>{formatMonthLabel(selectedMonth)}</Text>
          </Pressable>
          <Pressable
            onPress={() => !isCurrentMonth && setSelectedMonth(shiftMonth(selectedMonth, 1))}
            style={styles.monthArrow}
            disabled={isCurrentMonth}
          >
            <Text style={[styles.monthArrowText, isCurrentMonth && { opacity: 0.3 }]}>{'>'}</Text>
          </Pressable>
        </View>

        <View style={[styles.screen, { paddingTop: spacing.sm }]}>
          <ScrollView contentContainerStyle={styles.scrollContentBottom} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Search & Filter */}
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by note or category..."
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={localStyles.filterRow}>
              <Pressable
                style={[styles.chip, !filterCategory && styles.chipSelected]}
                onPress={() => setFilterCategory(null)}
              >
                <Text style={[styles.chipText, !filterCategory && styles.chipTextSelected]}>All</Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[styles.chip, filterCategory === cat.id && styles.chipSelected]}
                  onPress={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
                >
                  <Text style={[styles.chipText, filterCategory === cat.id && styles.chipTextSelected]}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
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
                      <Pressable
                        key={expense.id}
                        style={localStyles.transactionItem}
                        onPress={() => navigation.navigate('TransactionDetail', {
                          expense,
                          categoryName: getCategoryName(expense.categoryId),
                          monthKey: selectedMonth,
                        })}
                      >
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
                      </Pressable>
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
    filterRow: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xs,
      gap: 6,
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
