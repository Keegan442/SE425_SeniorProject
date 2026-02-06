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
import { getCategoriesWithSpent, Category } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';

type CategoryWithSpent = Category & { spent: number };

export default function BudgetsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const localStyles = createLocalStyles(colors);
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState<CategoryWithSpent[]>([]);

  const loadBudgets = useCallback(async () => {
    if (!session?.userId) return;
    try {
      const cats = await getCategoriesWithSpent(session.userId);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    }
  }, [session?.userId]);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets])
  );

  // Filter categories that have a budget limit set
  const budgetsWithLimits = categories.filter(c => c.limit && c.limit > 0);

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screenHeaderRow}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>Budgets</Text>
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
            {budgetsWithLimits.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.h2}>Budgets</Text>
                <Text style={[styles.muted, styles.marginTopMd]}>No budgets set yet. Set your first one!</Text>
              </View>
            ) : (
              <View style={styles.card}>
                {budgetsWithLimits.map((category) => {
                  const percentage = category.limit ? Math.min((category.spent / category.limit) * 100, 100) : 0;
                  const isOverBudget = category.spent > (category.limit || 0);
                  
                  return (
                    <View key={category.id} style={localStyles.budgetItem}>
                      <Text style={localStyles.categoryName}>{category.name}</Text>
                      <View style={localStyles.progressContainer}>
                        <View style={localStyles.progressBar}>
                          <View 
                            style={[
                              localStyles.progressFill,
                              { 
                                width: `${percentage}%`,
                                backgroundColor: isOverBudget ? colors.danger : colors.ok 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                      <View style={localStyles.amountRow}>
                        <Text style={[localStyles.spent, isOverBudget && { color: colors.danger }]}>
                          {formatAmount(category.spent)}
                        </Text>
                        <Text style={localStyles.limit}>
                          / {formatAmount(category.limit || 0)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="+ Set Budget"
                onPress={() => navigation.navigate('AddBudget')}
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
