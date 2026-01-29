import { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getColors, getAppStyles, spacing } from '../style/appStyles';
import { AuthContext } from '../auth/AuthContext';

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

export function Menu({ visible, onClose }: MenuProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useContext(AuthContext);
  const navigation = useNavigation();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const [slideAnim] = useState(new Animated.Value(-300));

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={menuStyles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            menuStyles.drawer,
            { backgroundColor: colors.card, borderRightColor: colors.border, transform: [{ translateX: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[menuStyles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[menuStyles.wordmarkCash, { color: colors.text }]}>Cash</Text>
              <Text style={[menuStyles.wordmarkFlow, { color: colors.text }]}>Flow</Text>
            </View>
            <View style={menuStyles.headerRight}>
              <Pressable onPress={onClose} style={menuStyles.closeButton}>
                <Text style={[styles.body, { fontSize: 20 }]}>✕</Text>
              </Pressable>
            </View>
          </View>

          <View style={menuStyles.content}>
            <Pressable
              style={[
                menuStyles.menuItem,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                navigation.navigate('Home');
                onClose();
              }}
            >
              <Text style={[styles.body, { flex: 1 }]}>Dashboard</Text>
            </Pressable>

            <Pressable
              style={[
                menuStyles.menuItem,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                navigation.navigate('Profile');
                onClose();
              }}
            >
              <Text style={[styles.body, { flex: 1 }]}>Profile</Text>
            </Pressable>

            <Pressable
              style={menuStyles.menuItem}
              onPress={() => {
                signOut();
                onClose();
              }}
            >
              <Text style={[styles.body, { color: colors.danger, flex: 1 }]}>Sign Out</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: 260,
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 38, // spacing.xl (28) + 10
    borderBottomWidth: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  wordmarkCash: {
    fontSize: 22,
    fontWeight: '200',
    letterSpacing: 4,
  },
  wordmarkFlow: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 4,
    marginLeft: 2,
  },
});
