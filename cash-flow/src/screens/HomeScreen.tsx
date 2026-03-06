import { useContext, useState, useCallback } from 'react';
import { Text, View, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../auth/AuthContext';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors } from '../style/appStyles';
import { useCurrency } from '../theme/CurrencyContext';
import { monthKey } from '../utils/date';
import { getTransactions } from '../api/transactionsApi';
import { getCategories } from '../api/categoriesApi';
import { getSubscriptions } from '../api/subscriptionsapi';
import { getBudgets } from '../api/budgetsApi';
import { getBudgetColor } from '../utils/getBudgetColor';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function HomeScreen() {
  const { session } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { formatAmount } = useCurrency();
  const navigation = useNavigation();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const [income, setIncome] = useState(0);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);
  const [budgets, setBudgets] = useState<any[]>([]);
  const screenWidth = Dimensions.get('window').width;
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [yearlyChartData, setYearlyChartData] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!session?.userId) return;

    try {
      const [transactions, categories, subs, budgetsData] = await Promise.all([
        getTransactions(session.userId, monthKey()),
        getCategories(session.userId),
        getSubscriptions(session.userId),
        getBudgets(session.userId)
      ]);

      const categoryMap: Record<string, 'income' | 'expense'> = {};

      categories.forEach((c: any) => {
        categoryMap[String(c.category_id)] = c.category_type;
      });

      let incomeTotal = 0;
      let expenseTotal = 0;

      transactions.forEach((t: any) => {
        const type = categoryMap[String(t.category_id)];
        const amount = Number(t.transaction_amount) || 0;

        if (type === 'income') {
          incomeTotal += amount;
        } else {
          expenseTotal += amount;
        }
      });

      const spentMap: Record<number, number> = {};

      transactions.forEach((t: any) => {
        const catId = Number(t.category_id);
        const amount = Number(t.transaction_amount) || 0;

        if (!spentMap[catId]) spentMap[catId] = 0;
        spentMap[catId] += amount;
      });

      const activeBudgets = budgetsData
        .filter((b: any) => b.isActive)
        .map((b: any) => ({
          ...b,
          spent: spentMap[b.categoryId] || 0,
          categoryName:
            categories.find((c: any) => c.category_id === b.categoryId)?.category_name ||
            'Unknown'
        }));

      setBudgets(activeBudgets);

      const activeSubs = subs.filter((s: any) => s.isActive);

      const subTotal = activeSubs.reduce(
        (sum: number, s: any) => sum + s.amountPerMonth,
        0
      );

      const categoryTotals: Record<string, number> = {};

      transactions.forEach((t: any) => {
        const catId = String(t.category_id);
        const type = categoryMap[catId];
        const amount = Number(t.transaction_amount) || 0;

        if (type !== 'expense') return;

        if (!categoryTotals[catId]) categoryTotals[catId] = 0;
        categoryTotals[catId] += amount;
      });

      if (subTotal > 0) {
        categoryTotals["subscriptions"] = subTotal;
      }

      const chartColors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#8BC34A',
        '#E91E63',
        '#00BCD4',
        '#FFC107',
        '#3F51B5',
        '#9C27B0',
      ];

      const monthlyData = Object.entries(categoryTotals).map(
        ([catId, total], index) => {
          let name = "Other";

          if (catId === "subscriptions") {
            name = "Subscriptions";
          } else {
            const category = categories.find(
              (c: any) => String(c.category_id) === catId
            );
            name = category?.category_name || "Other";
          }

          return {
            key: catId,
            name,
            amount: total,
            color: chartColors[index % chartColors.length],
            legendFontColor: colors.text,
            legendFontSize: 12,
          };
        }
      );

      setMonthlyChartData(monthlyData);

      setSubscriptions(activeSubs);
      setSubscriptionTotal(subTotal);

      setIncome(incomeTotal);
      setSpent(expenseTotal);
      setRemaining(incomeTotal - expenseTotal - subTotal);

    } catch (error) {
      console.error(error);
      setIncome(0);
      setSpent(0);
      setRemaining(0);
    }
  }, [session?.userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screenHeaderRow}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>CashFlow</Text>
          <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
            <Image
              source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.screen}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardTight}>
            <Text style={styles.smallMuted}>This month</Text>
            <View style={styles.marginTopSm}>
              <Text
                style={[
                  styles.bigMoney,
                  { color: remaining >= 0 ? '#00C851' : colors.danger }
                ]}
              >
                {formatAmount(remaining)}
              </Text>
            </View>
            <View style={styles.marginTopSm}>
              <Text style={styles.muted}>Remaining balance</Text>
            </View>

            <View style={styles.rowTopSpaced}>
              <Pressable 
                style={[styles.pill, styles.pillRight]}
                onPress={() => navigation.navigate('Transactions')}
              >
                <Text style={styles.smallMuted}>Income</Text>
                <View style={styles.marginTopPill}>
                  <Text style={[styles.h2, { color: '#00C851' }]}>
                    {formatAmount(income)}
                  </Text>
                </View>
              </Pressable>
              <Pressable 
                style={styles.pill}
                onPress={() => navigation.navigate('Transactions')}
              >
                <Text style={styles.smallMuted}>Spent</Text>
                <View style={styles.marginTopPill}>
                  <Text style={[styles.h2, { color: colors.danger }]}>
                    {formatAmount(spent)}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, styles.marginTopMd]}>
            <Text style={styles.smallMuted}>Monthly Subscriptions</Text>

            <View style={styles.marginTopSm}>
              <Text style={styles.h2}>{formatAmount(subscriptionTotal)}</Text>
            </View>

            {subscriptions.slice(0, 3).map((sub) => (
              <View key={sub.id} style={styles.marginTopSm}>
                <Text style={styles.muted}>
                  {sub.name} • {formatAmount(sub.amountPerMonth)}
                </Text>
              </View>
            ))}

            {subscriptions.length > 3 && (
              <Pressable
                style={styles.marginTopSm}
                onPress={() => navigation.navigate('Subscriptions')}
              >
                <Text style={{ color: colors.accent }}>
                  View all subscriptions →
                </Text>
              </Pressable>
            )}
          </View>

          <View style={[styles.card, styles.marginTopMd]}>
            <Text style={styles.smallMuted}>Active Budgets</Text>

            {budgets.length === 0 ? (
              <Text style={[styles.muted, styles.marginTopSm]}>
                No active budgets
              </Text>
            ) : (
              budgets.slice(0, 3).map((budget) => {
                const pct = Math.min(budget.spent / budget.limitAmount, 1);
                const over = budget.spent > budget.limitAmount;

                return (
                  <View key={budget.budgetId} style={{ marginTop: 12 }}>
                    <Text style={styles.muted}>{budget.categoryName}</Text>

                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.border,
                        borderRadius: 4,
                        overflow: 'hidden',
                        marginTop: 4
                      }}
                    >
                      <View
                        style={{
                          width: `${pct * 100}%`,
                          height: '100%',
                          backgroundColor: getBudgetColor(pct, colors)
                        }}
                      />
                    </View>

                    <Text style={[styles.smallMuted, { marginTop: 2 }]}>
                      {formatAmount(budget.spent)} / {formatAmount(budget.limitAmount)}
                    </Text>
                  </View>
                );
              })
            )}

            {budgets.length > 3 && (
              <Pressable
                style={styles.marginTopSm}
                onPress={() => navigation.navigate('Budgets')}
              >
                <Text style={{ color: colors.accent }}>
                  View all budgets →
                </Text>
              </Pressable>
            )}
          </View>

          <View style={[styles.card, styles.marginTopMd]}>
            <Text style={styles.smallMuted}>Spending by Category (Month)</Text>

            {monthlyChartData.length === 0 ? (
              <Text style={[styles.muted, styles.marginTopSm]}>
                No spending data
              </Text>
            ) : (
              <PieChart
                data={monthlyChartData}
                width={screenWidth - 60}
                height={200}
                chartConfig={{
                  color: () => colors.text,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="70"
                hasLegend={false}
              />
            )}

            <View style={{ marginTop: 12 }}>
              {monthlyChartData.map((item) => (
                <View
                  key={item.key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 6
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: item.color,
                      marginRight: 8
                    }}
                  />

                  <Text style={styles.muted}>
                    {item.name} - {formatAmount(item.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}
