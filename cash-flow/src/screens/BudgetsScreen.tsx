import { useState, useContext, useCallback } from 'react';
import { Text, View, Image, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors, spacing } from '../style/appStyles';
import { AuthContext } from '../auth/AuthContext';
import { getBudgets, Budget } from '../api/budgetsApi';
import { getCategories } from '../api/categoriesApi';
import { getTransactions } from '../api/transactionsApi';
import { useCurrency } from '../theme/CurrencyContext';
import { monthKey } from '../utils/date';
import { getBudgetColor } from '../utils/getBudgetColor';

type BudgetWithSpent = Budget & {
  categoryName: string;
  spent: number;
};

export default function BudgetsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const localStyles = createLocalStyles(colors);
  const navigation = useNavigation();

  const [menuVisible, setMenuVisible] = useState(false);
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);

  const loadBudgets = useCallback(async () => {
    if (!session?.userId) return;

    try {
      const [budgetsData, categories, transactions] = await Promise.all([
        getBudgets(session.userId),
        getCategories(session.userId),
        getTransactions(session.userId, monthKey()),
      ]);

      const categoryMap: Record<number, string> = {};
      categories.forEach((c: any) => {
        categoryMap[c.category_id] = c.category_name;
      });

      const spentMap: Record<number, number> = {};

      transactions.forEach((t: any) => {
        const catId = Number(t.category_id);
        const amount = Number(t.transaction_amount) || 0;

        spentMap[catId] = (spentMap[catId] || 0) + amount;
      });

      const combined: BudgetWithSpent[] = budgetsData.map((b) => ({
        ...b,
        categoryName: categoryMap[b.categoryId] || 'Unknown',
        spent: spentMap[b.categoryId] || 0,
      }));

      setBudgets(combined);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      Alert.alert('Error', 'Failed to load budgets. Please try again.');
    }
  }, [session?.userId]);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets])
  );

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screenHeaderRow}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>Budgets</Text>

          <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
            <Image
              source={
                theme === 'dark'
                  ? require('../../assets/images/DarkLogo.png')
                  : require('../../assets/images/LightLogo.png')
              }
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={{ marginTop: spacing.lg }}>
              <Button
                title="+ Set Budget"
                onPress={() => navigation.navigate('AddBudget')}
                variant="primary"
              />
        </View>

        <View style={styles.screen}>
          <ScrollView
            contentContainerStyle={styles.scrollContentBottom}
            showsVerticalScrollIndicator={false}
          >
            {budgets.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.h2}>Budgets</Text>
                <Text style={[styles.muted, styles.marginTopMd]}>
                  No budgets set yet. Set your first one!
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                {budgets.map((budget) => {
                  const percentage = Math.min(
                    (budget.spent / budget.limitAmount) * 100,
                    100
                  );

                  const isOverBudget = budget.spent > budget.limitAmount;

                  return (
                    <Pressable
                      key={budget.budgetId}
                      style={localStyles.budgetItem}
                      onPress={() =>
                        navigation.navigate('BudgetDetail', { budget })
                      }
                    >
                      <Text style={localStyles.categoryName}>
                        {budget.categoryName}
                      </Text>

                      <View style={localStyles.progressContainer}>
                        <View style={localStyles.progressBar}>
                          <View
                            style={[
                              localStyles.progressFill,
                              {
                                width: `${percentage}%`,
                                backgroundColor: getBudgetColor(percentage / 100, colors)
                              },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={localStyles.amountRow}>
                        <Text
                          style={[
                            localStyles.spent,
                            isOverBudget && { color: colors.danger },
                          ]}
                        >
                          {formatAmount(budget.spent)}
                        </Text>

                        <Text style={localStyles.limit}>
                          / {formatAmount(budget.limitAmount)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

          </ScrollView>
        </View>
      </SafeAreaView>

      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

function createLocalStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    budgetItem: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    progressContainer: {
      marginVertical: spacing.xs,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xs,
    },
    spent: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    limit: {
      fontSize: 14,
      color: colors.muted,
    },
  });
}