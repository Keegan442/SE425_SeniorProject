import { useContext, useState } from 'react';
import { View, Text, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles } from '../style/appStyles';
import { Button } from '../components/Button';
import { AuthContext } from '../auth/AuthContext';
import { deleteSubscription } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';
import type { RootStackParamList } from '../navigation/types';

type RouteParams = RouteProp<RootStackParamList, 'SubscriptionDetail'>;

const CYCLE_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function SubscriptionDetailScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { subscription } = route.params;
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    Alert.alert('Delete Subscription', `Are you sure you want to delete "${subscription.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!session?.userId) return;
          try {
            setDeleting(true);
            await deleteSubscription(session.userId, subscription.id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete subscription');
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
        <Text style={styles.title}>Subscription</Text>
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
          <Text style={[styles.formSectionTitle, { marginBottom: 4 }]}>Name</Text>
          <Text style={styles.h2}>{subscription.name}</Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>Amount</Text>
          <Text style={styles.h2Large}>{formatAmount(subscription.amount)}</Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>Billing Cycle</Text>
          <Text style={styles.h2}>{CYCLE_LABELS[subscription.billingCycle] || subscription.billingCycle}</Text>

          {subscription.nextBillingDate ? (
            <>
              <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>Next Billing Date</Text>
              <Text style={styles.h2}>{subscription.nextBillingDate}</Text>
            </>
          ) : null}
        </View>

        {/* Delete Button */}
        <View style={styles.formButtonContainer}>
          <Button
            title="Delete Subscription"
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
