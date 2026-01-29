import { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Animated, Image } from 'react-native';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Text style={[styles.title, { fontSize: 20 }]}>Menu</Text>
            <View style={menuStyles.headerRight}>
              <Image 
                source={require('../../assets/images/Cashflow.png')} 
                style={menuStyles.logo}
                resizeMode="contain"
              />
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
                toggleTheme();
              }}
            >
              <Text style={[styles.body, { flex: 1 }]}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Text>
              <Text style={[styles.muted, { fontSize: 20 }]}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </Text>
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
});
