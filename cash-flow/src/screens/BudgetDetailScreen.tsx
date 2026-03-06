import { useContext, useState } from 'react';
import { View, Text, Pressable, Alert, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles, spacing } from '../style/appStyles';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { toggleBudgetActive, deleteBudget } from '../api/budgetsApi';
import { useCurrency } from '../theme/CurrencyContext';
import type { RootStackParamList } from '../navigation/types';

type BudgetDetailRoute = RouteProp<RootStackParamList, 'BudgetDetail'>;

type BudgetWithMeta = {
  budgetId: number;
  categoryName: string;
  spent: number;
  limitAmount: number;
  isActive: boolean;
};

export default function BudgetDetailScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const navigation = useNavigation();
  const route = useRoute<BudgetDetailRoute>();
  const { budget } = route.params;
  const [active, setActive] = useState(budget.isActive);
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const local = createLocalStyles(colors);
  const [deleting, setDeleting] = useState(false);

  const limit = budget.limitAmount;
  const remaining = limit - budget.spent;
  const pct = limit > 0 ? Math.min(budget.spent / limit, 1) : 0;
  const overBudget = budget.spent > limit;

  async function handleDelete() {
    Alert.alert('Delete Budget', `Delete the budget for "${budget.categoryName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteBudget(budget.budgetId);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete budget');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  async function handleToggleActive() {
    try {
      const newState = !active;

      await toggleBudgetActive(budget.budgetId, newState);

      setActive(newState);
    } catch {
      Alert.alert('Error', 'Failed to update budget status');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.screenHeaderRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.formBackButton}>
          <Text style={styles.formBackText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Budget</Text>
        <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
          <Image
            source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={[styles.formSectionTitle, { marginBottom: 4 }]}>Category</Text>
          <Text style={styles.h2}>{budget.categoryName}</Text>
          <Text style={{ color: active ? colors.ok : colors.muted }}>
            {active ? 'Active Budget' : 'Inactive Budget'}
          </Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>Limit</Text>
          <Text style={styles.h2Large}>{formatAmount(limit)}</Text>

          {/* Progress Bar */}
          <View style={[local.progressContainer, styles.formSectionMargin]}>
            <View style={[local.progressBar, { width: `${pct * 100}%`, backgroundColor: overBudget ? colors.danger : colors.ok }]} />
          </View>

          <View style={local.statsRow}>
            <View>
              <Text style={styles.formSectionTitle}>Spent</Text>
              <Text style={[styles.h2, { color: overBudget ? colors.danger : colors.text }]}>
                {formatAmount(budget.spent)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.formSectionTitle}>Remaining</Text>
              <Text style={[styles.h2, { color: remaining < 0 ? colors.danger : colors.ok }]}>
                {formatAmount(remaining)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formButtonContainer}>
          <Button
            title={active ? "Deactivate Budget" : "Activate Budget"}
            onPress={handleToggleActive}
            variant="outline"
          />
        </View>

        {/* Delete Button */}
        <View style={styles.formButtonContainer}>
          <Button
            title="Delete Budget"
            onPress={handleDelete}
            disabled={deleting}
            loading={deleting}
            variant="danger"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createLocalStyles(colors: ReturnType<typeof getColors>) {
  return StyleSheet.create({
    progressContainer: {
      height: 10,
      backgroundColor: colors.card,
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 5,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
    },
  });
}
