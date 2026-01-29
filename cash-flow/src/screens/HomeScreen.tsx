import { useContext, useEffect, useMemo, useState } from 'react';
import { Text, View, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContext';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors } from '../style/appStyles';
import { useCurrency } from '../theme/CurrencyContext';
import { monthKey } from '../utils/date';
import { getMonthData } from '../data/budgetStore';
import { sumExpenses } from '../data/budgetMath';

export default function HomeScreen() {
  const { session } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { formatAmount } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const [income, setIncome] = useState(0);
  const [spent, setSpent] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!session?.userId) return;
      try {
        const { month } = await getMonthData(session.userId, monthKey());
        if (!mounted) return;
        const incomeValue = Number(month?.income) || 0;
        const spentValue = sumExpenses(month?.expenses);
        setIncome(isNaN(incomeValue) ? 0 : incomeValue);
        setSpent(isNaN(spentValue) ? 0 : spentValue);
      } catch {
        if (!mounted) return;
        setIncome(0);
        setSpent(0);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session?.userId]);

  const remaining = useMemo(() => {
    const result = income - spent;
    return isNaN(result) ? 0 : result;
  }, [income, spent]);

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

        <View style={styles.screen}>
          <View style={styles.cardTight}>
            <Text style={styles.smallMuted}>This month</Text>
            <View style={styles.marginTopSm}>
              <Text style={styles.bigMoney}>{formatAmount(remaining)}</Text>
            </View>
            <View style={styles.marginTopSm}>
              <Text style={styles.muted}>Remaining balance</Text>
            </View>

            <View style={styles.rowTopSpaced}>
              <View style={[styles.pill, styles.pillRight]}>
                <Text style={styles.smallMuted}>Income</Text>
                <View style={styles.marginTopPill}>
                  <Text style={styles.h2}>{formatAmount(income)}</Text>
                </View>
              </View>
              <View style={styles.pill}>
                <Text style={styles.smallMuted}>Spent</Text>
                <View style={styles.marginTopPill}>
                  <Text style={styles.h2}>{formatAmount(spent)}</Text>
                </View>
              </View>
            </View>
          </View>

        </View>
      </SafeAreaView>
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}
