import { useState, useContext, useCallback } from 'react';
import { Text, View, Image, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors, spacing } from '../style/appStyles';
import { AuthContext } from '../auth/AuthContext';
import { getTransactions } from '../api/transactionsApi';
import { getCategories } from '../api/categoriesApi';
import { getSubscriptions, Subscription } from '../api/subscriptionsapi';
import { useCurrency } from '../theme/CurrencyContext';
import { monthKey, shiftMonth } from '../utils/date';
import { generatePdfHtml, generateCsvContent, generateYearlyPdfHtml, generateYearlyCsvContent, formatMonthLabel } from '../utils/exportReport';

type Month = {
  income: number;
  expenses: {
    id: string;
    categoryId: string;
    amount: number;
    note?: string;
    date: string;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
};

type ApiCategory = {
  category_id: number;
  category_name: string;
  category_type: 'income' | 'expense';
};

export default function DownloadsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const localStyles = createLocalStyles(colors);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(monthKey());
  const [monthData, setMonthData] = useState<Month | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | 'year-pdf' | 'year-csv' | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; total: number }[]>([]);

  const loadData = useCallback(async () => {
    if (!session?.userId) return;

    try {
      const transactions = await getTransactions(session.userId, selectedMonth);
      const subscriptions = await getSubscriptions(session.userId);
      const cats = await getCategories(session.userId);

      const mappedCats: { id: string; name: string }[] = cats.map((cat: ApiCategory) => ({
        id: String(cat.category_id),
        name: cat.category_name
      }));

      const categoryMap: Record<string, 'income' | 'expense'> = {};

      cats.forEach((cat: ApiCategory) => {
        categoryMap[String(cat.category_id)] = cat.category_type;
      });

      let income = 0;

      const expenses: Month['expenses'] = [];

      transactions.forEach((t: any) => {
        const type = categoryMap[String(t.category_id)];
        const amount = Number(t.transaction_amount);

        if (type === 'income') {
          income += amount;
        } else if (type === 'expense') {
          expenses.push({
            id: String(t.transaction_id),
            categoryId: String(t.category_id),
            amount,
            note: t.transaction_name,
            date: t.transaction_date,
          });
        } else {
          console.warn(`Unknown category type for transaction ${t.transaction_id}:`, t.category_id, type);
        }
      });

      mappedCats.push({ id: 'subscription', name: 'Subscriptions' });

      subscriptions.forEach((sub: Subscription) => {
        expenses.push({
          id: `sub-${sub.id}`,
          categoryId: 'subscription',
          amount: sub.amountPerMonth,
          note: sub.name + ' (Subscription)',
          date: sub.startDate
        });
      });

      const month: Month = {
        income,
        expenses,
        categories: mappedCats
      };

      setMonthData(month);

      const totals: Record<string, number> = {};
      for (const exp of expenses) {
        totals[exp.categoryId] = (totals[exp.categoryId] || 0) + exp.amount;
      }

      setCategoryBreakdown(
        mappedCats
          .filter((cat: { id: string; name: string }) => totals[cat.id])
          .map((cat: { id: string; name: string }) => ({
            name: cat.name,
            total: totals[cat.id]
          }))
          .sort((a, b) => b.total - a.total)
      );

    } catch (error) {
      console.error('Failed to load month data:', error);
      Alert.alert('Error', 'Failed to load report data.');
    }
  }, [session?.userId, selectedMonth]);
  
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const isCurrentMonth = selectedMonth === monthKey();
  const label = formatMonthLabel(selectedMonth);
  const income = monthData?.income || 0;
  const totalSpent = monthData ? monthData.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const remaining = income - totalSpent;
  const transactionCount = monthData?.expenses?.length || 0;

  async function handleExportPdf() {
    if (!monthData) return;
    try {
      setExporting('pdf');
      const html = generatePdfHtml(monthData, monthData.categories, formatAmount, label);
      const { uri } = await Print.printToFileAsync({ html });
      const tempPdf = new File(uri);
      const namedPdf = new File(Paths.cache, `cashflow_${selectedMonth}.pdf`);
      if (namedPdf.exists) namedPdf.delete();
      tempPdf.move(namedPdf);
      await shareAsync(namedPdf.uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setExporting(null);
    }
  }

  async function handleExportCsv() {
    if (!monthData) return;
    try {
      setExporting('csv');
      const csv = generateCsvContent(monthData, monthData.categories, label);
      const file = new File(Paths.cache, `cashflow_${selectedMonth}.csv`);
      file.create({ overwrite: true });
      file.write(csv);
      await shareAsync(file.uri, { mimeType: 'text/csv' });
    } catch (error) {
      console.error('Failed to generate CSV:', error);
      Alert.alert('Error', 'Failed to generate CSV');
    } finally {
      setExporting(null);
    }
  }

  const selectedYear = selectedMonth.split('-')[0];

  async function handleExportYearPdf() {
    if (!session?.userId) return;

    try {
      setExporting('year-pdf');

      const months: Record<string, any> = {};

      for (let m = 1; m <= 12; m++) {
        const monthKey = `${selectedYear}-${String(m).padStart(2, '0')}`;
        const data = await getTransactions(session.userId, monthKey);

        if (data.length > 0) {
          months[monthKey] = data;
        }
      }

      if (Object.keys(months).length === 0) {
        Alert.alert('No Data', `No transactions found for ${selectedYear}.`);
        return;
      }

      const html = generateYearlyPdfHtml(months, formatAmount, selectedYear);
      const { uri } = await Print.printToFileAsync({ html });

      const tempPdf = new File(uri);
      const namedPdf = new File(Paths.cache, `cashflow_${selectedYear}.pdf`);

      if (namedPdf.exists) namedPdf.delete();
      tempPdf.move(namedPdf);

      await shareAsync(namedPdf.uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate yearly PDF');
    } finally {
      setExporting(null);
    }
  }

  async function handleExportYearCsv() {
    if (!session?.userId) return;

    try {
      setExporting('year-csv');

      const months: Record<string, any> = {};

      for (let m = 1; m <= 12; m++) {
        const monthKey = `${selectedYear}-${String(m).padStart(2, '0')}`;
        const data = await getTransactions(session.userId, monthKey);

        if (data.length > 0) {
          months[monthKey] = data;
        }
      }

      if (Object.keys(months).length === 0) {
        Alert.alert('No Data', `No transactions found for ${selectedYear}.`);
        return;
      }

      const csv = generateYearlyCsvContent(months, selectedYear);

      const file = new File(Paths.cache, `cashflow_${selectedYear}.csv`);
      file.create({ overwrite: true });
      file.write(csv);

      await shareAsync(file.uri, { mimeType: 'text/csv' });

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate yearly CSV');
    } finally {
      setExporting(null);
    }
  }

  function handleExportYear() {
    Alert.alert(
      `Export Full Year — ${selectedYear}`,
      'Choose a format',
      [
        { text: 'PDF', onPress: handleExportYearPdf },
        { text: 'CSV', onPress: handleExportYearCsv },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screenHeaderRow}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>Downloads</Text>
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
            <Text style={styles.monthLabel}>{label}</Text>
          </Pressable>
          <Pressable
            onPress={() => !isCurrentMonth && setSelectedMonth(shiftMonth(selectedMonth, 1))}
            style={styles.monthArrow}
            disabled={isCurrentMonth}
          >
            <Text style={[styles.monthArrowText, isCurrentMonth && { opacity: 0.3 }]}>{'>'}</Text>
          </Pressable>
        </View>

        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContentBottom} showsVerticalScrollIndicator={false}>
            {/* Summary Card */}
            <View style={styles.card}>
              <Text style={[styles.h2, { textAlign: 'center' }]}>{label}</Text>
              <View style={localStyles.summaryRow}>
                <View style={localStyles.summaryItem}>
                  <Text style={styles.smallMuted}>Income</Text>
                  <Text style={[localStyles.summaryValue, { color: colors.ok }]}>{formatAmount(income)}</Text>
                </View>
                <View style={localStyles.summaryItem}>
                  <Text style={styles.smallMuted}>Spent</Text>
                  <Text style={[localStyles.summaryValue, { color: colors.danger }]}>{formatAmount(totalSpent)}</Text>
                </View>
                <View style={localStyles.summaryItem}>
                  <Text style={styles.smallMuted}>Remaining</Text>
                  <Text style={localStyles.summaryValue}>{formatAmount(remaining)}</Text>
                </View>
              </View>
              <Text style={[styles.smallMuted, { textAlign: 'center', marginTop: spacing.md }]}>
                {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
              <View style={[styles.card, { marginTop: spacing.md }]}>
                <Text style={[styles.h2, { textAlign: 'center', marginBottom: spacing.md }]}>
                  Spending by Category
                </Text>
                {categoryBreakdown.map((cat) => (
                  <View key={cat.name} style={localStyles.breakdownRow}>
                    <Text style={localStyles.breakdownName}>{cat.name}</Text>
                    <Text style={localStyles.breakdownAmount}>{formatAmount(cat.total)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Export Buttons */}
            {transactionCount === 0 && (
              <Text style={[styles.muted, { textAlign: 'center', marginTop: spacing.lg }]}>
                No transactions to export for this month.
              </Text>
            )}
            <View style={{ marginTop: spacing.lg }}>
              <Button
                title={exporting === 'pdf' ? 'Generating...' : 'Export as PDF'}
                onPress={handleExportPdf}
                disabled={exporting !== null || transactionCount === 0}
                loading={exporting === 'pdf'}
                variant="primary"
              />
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Button
                title={exporting === 'csv' ? 'Generating...' : 'Export as CSV'}
                onPress={handleExportCsv}
                disabled={exporting !== null || transactionCount === 0}
                loading={exporting === 'csv'}
                variant="outline"
              />
            </View>

            {/* Yearly Export */}
            <View style={localStyles.divider} />
            <View style={{ marginTop: spacing.sm }}>
              <Button
                title={exporting === 'year-pdf' || exporting === 'year-csv' ? 'Generating...' : `Export Full Year — ${selectedYear}`}
                onPress={handleExportYear}
                disabled={exporting !== null}
                loading={exporting === 'year-pdf' || exporting === 'year-csv'}
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
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    breakdownName: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    breakdownAmount: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.danger,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xl,
    },
  });
}
