import { useState } from 'react';
import { Text, View, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors, spacing } from '../style/appStyles';

export default function TransactionsScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 4 }}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>Transactions</Text>
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
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.h2}>Transactions</Text>
              <Text style={[styles.muted, { marginTop: spacing.md }]}>Your transactions will appear here</Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}
