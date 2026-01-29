import { useContext, useEffect, useMemo, useState } from 'react';
import { Text, View, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContext';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors, spacing } from '../style/appStyles';
import { monthKey } from '../utils/date';
import { getMonthData } from '../data/budgetStore';
import { sumExpenses } from '../data/budgetMath';

export default function HomeScreen() {
  const { session } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 4 }}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>CashFlow</Text>
          <Pressable
            onPress={toggleTheme}
            style={{ padding: spacing.xs, minWidth: 32, alignItems: 'center', justifyContent: 'center' }}
          >
            <Image
              source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={styles.screen}>
          <View style={styles.cardTight}>
            <Text style={styles.smallMuted}>This month</Text>
            <View style={{ marginTop: spacing.sm }}>
              <Text style={styles.bigMoney}>
                ${typeof remaining === 'number' && !isNaN(remaining) ? remaining.toFixed(2) : '0.00'}
              </Text>
            </View>
            <View style={{ marginTop: spacing.sm }}>
              <Text style={styles.muted}>Remaining balance</Text>
            </View>

            <View style={styles.rowTopSpaced}>
              <View style={[styles.pill, { marginRight: spacing.md }]}>
                <Text style={styles.smallMuted}>Income</Text>
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.h2}>
                    ${typeof income === 'number' && !isNaN(income) ? income.toFixed(2) : '0.00'}
                  </Text>
                </View>
              </View>
              <View style={styles.pill}>
                <Text style={styles.smallMuted}>Spent</Text>
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.h2}>
                    ${typeof spent === 'number' && !isNaN(spent) ? spent.toFixed(2) : '0.00'}
                  </Text>
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
