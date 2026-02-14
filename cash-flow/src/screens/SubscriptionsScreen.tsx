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
import { getSubscriptions, Subscription } from '../data/budgetStore';
import { useCurrency } from '../theme/CurrencyContext';

const CYCLE_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const WEEKS_PER_MONTH = 52 / 12;

export default function SubscriptionsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useContext(AuthContext);
  const { formatAmount } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const localStyles = createLocalStyles(colors);
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const loadSubscriptions = useCallback(async () => {
    if (!session?.userId) return;
    try {
      const subs = await getSubscriptions(session.userId);
      setSubscriptions(subs);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions. Please try again.');
    }
  }, [session?.userId]);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptions();
    }, [loadSubscriptions])
  );

  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'weekly') return sum + (sub.amount * WEEKS_PER_MONTH);
    if (sub.billingCycle === 'yearly') return sum + (sub.amount / 12);
    return sum + sub.amount;
  }, 0);

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screenHeaderRow}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>Subscriptions</Text>
          <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
            <Image source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')} style={styles.logoImage} resizeMode="contain" />
          </Pressable>
        </View>

        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContentBottom} showsVerticalScrollIndicator={false}>
            {subscriptions.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.h2}>Subscriptions</Text>
                <Text style={[styles.muted, styles.marginTopMd]}>No subscriptions yet. Add your first one!</Text>
              </View>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={localStyles.totalLabel}>Monthly Total</Text>
                  <Text style={localStyles.totalAmount}>{formatAmount(monthlyTotal)}</Text>
                </View>

                <View style={[styles.card, { marginTop: spacing.md }]}>
                  {subscriptions.map((sub) => (
                    <Pressable
                      key={sub.id}
                      style={localStyles.subItem}
                      onPress={() => navigation.navigate('SubscriptionDetail', { subscription: sub })}
                    >
                      <Text style={localStyles.subName}>{sub.name}</Text>
                      <Text style={localStyles.subCycle}>{CYCLE_LABELS[sub.billingCycle]}</Text>
                      <Text style={localStyles.subAmount}>{formatAmount(sub.amount)}</Text>
                      {sub.nextBillingDate && (
                        <Text style={localStyles.subDate}>Next: {sub.nextBillingDate}</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="+ Add Subscription"
                onPress={() => navigation.navigate('AddSubscription')}
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
    totalLabel: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
    },
    totalAmount: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    subItem: {
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    subName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    subCycle: {
      fontSize: 12,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 2,
    },
    subAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accent,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    subDate: {
      fontSize: 12,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 4,
    },
  });
}
