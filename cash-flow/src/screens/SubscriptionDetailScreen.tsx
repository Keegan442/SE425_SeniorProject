import { useState } from 'react';
import { View, Text, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles } from '../style/appStyles';
import { Button } from '../components/Button';
import { deleteSubscription, toggleSubscriptionActive } from '../api/subscriptionsapi';
import { useCurrency } from '../theme/CurrencyContext';
import type { RootStackParamList } from '../navigation/types';

type RouteParams = RouteProp<RootStackParamList, 'SubscriptionDetail'>;

export default function SubscriptionDetailScreen() {
  const { theme, toggleTheme } = useTheme();
  const { formatAmount } = useCurrency();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();

  const { subscription } = route.params;

  const colors = getColors(theme);
  const styles = getAppStyles(colors);

  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [active, setActive] = useState(subscription.isActive);

  async function handleToggleActive() {
    try {
      setUpdating(true);

      const updated = await toggleSubscriptionActive(
        subscription.id,
        !active
      );

      setActive(updated.isActive);
    } catch {
      Alert.alert('Error', 'Failed to update subscription');
    } finally {
      setUpdating(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${subscription.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteSubscription(subscription.id);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete subscription');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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

      <View style={styles.screen}>

        <View style={styles.card}>

          <Text style={[styles.formSectionTitle, { marginBottom: 4 }]}>
            Name
          </Text>
          <Text style={styles.h2}>
            {subscription.name}
          </Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>
            Monthly Cost
          </Text>
          <Text style={styles.h2Large}>
            {formatAmount(subscription.amountPerMonth)}
          </Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>
            Start Date
          </Text>
          <Text style={styles.h2}>
            {subscription.startDate ? subscription.startDate.split('T')[0] : ''}
          </Text>

          <Text style={[styles.formSectionTitle, styles.formSectionMargin, { marginBottom: 4 }]}>
            Status
          </Text>
          <Text style={styles.h2}>
            {active ? 'Active' : 'Inactive'}
          </Text>

        </View>

        <View style={styles.formButtonContainer}>
          <Button
            title={active ? 'Deactivate Subscription' : 'Activate Subscription'}
            onPress={handleToggleActive}
            loading={updating}
            variant="outline"
          />
        </View>

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