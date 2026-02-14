import { useContext, useState } from 'react';
import { View, Text, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles } from '../style/appStyles';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { deleteExpense } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import type { RootStackParamList } from '../navigation/types';

type RouteParams = RouteProp<RootStackParamList, 'TransactionDetail'>;

export default function TransactionDetailScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { expense, categoryName, monthKey } = route.params;
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!session?.userId) return;
          try {
            setDeleting(true);
            await deleteExpense(session.userId, expense.id, monthKey);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete transaction');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.screenHeaderRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.formBackButton}>
          <Text style={styles.formBackText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Transaction</Text>
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
          <Text style={[styles.formSectionTitle, { marginBottom: 4 }]}>Amount</Text>
          <Text style={[styles.h2Large, { color: colors.danger }]}>-{formatAmount(expense.amount)}</Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>Category</Text>
          <Text style={styles.h2}>{categoryName}</Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>Date</Text>
          <Text style={styles.h2}>{expense.dateIso}</Text>

          {expense.note ? (
            <>
              <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>Note</Text>
              <Text style={styles.body}>{expense.note}</Text>
            </>
          ) : null}
        </View>

        {/* Delete Button */}
        <View style={styles.formButtonContainer}>
          <Button
            title="Delete Transaction"
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
