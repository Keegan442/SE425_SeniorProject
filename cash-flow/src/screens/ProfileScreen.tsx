import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, View, Image, Alert, Pressable, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Menu } from '../components/Menu';
import { MenuButton } from '../components/MenuButton';
import { useTheme } from '../theme/ThemeContext';
import { getAppStyles, getColors, spacing } from '../style/appStyles';
import { getUserProfile, saveUserProfile, UserProfile } from '../data/profileStore';
import { useCurrency } from '../theme/CurrencyContext';
import { CURRENCIES, CURRENCY_OPTIONS } from '../utils/currency';
import { AVATARS, isEmojiAvatar, getEmojiFromAvatar, createAvatarString } from '../utils/avatars';

export default function ProfileScreen() {
  const { session } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { refreshCurrency } = useCurrency();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ firstName: '', lastName: '', profilePicture: null, birthday: null, currency: 'USD' });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [menuVisible, setMenuVisible] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  useEffect(() => {
    if (session?.userId) {
      loadProfile();
    }
  }, [session?.userId]);

  async function loadProfile() {
    if (!session?.userId) return;
    try {
      setLoading(true);
      const userProfile = await getUserProfile(session.userId);
      setProfile(userProfile);
      setFirstName(userProfile.firstName);
      setLastName(userProfile.lastName);
      setBirthday(userProfile.birthday ?? '');
      setCurrency(userProfile.currency ?? 'USD');
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!session?.userId) return;
    try {
      setSaving(true);
      const updatedProfile: UserProfile = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profilePicture: profile.profilePicture,
        birthday: birthday.trim() || null,
        currency: currency || 'USD',
      };
      await saveUserProfile(session.userId, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      await refreshCurrency();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handlePickImage() {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Choose Avatar',
          onPress: () => setAvatarPickerVisible(true),
        },
        {
          text: 'Camera',
          onPress: handleTakePhoto,
        },
        {
          text: 'Photo Library',
          onPress: handlePickFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }

  function handleSelectAvatar(avatarId: string) {
    setProfile({ ...profile, profilePicture: createAvatarString(avatarId) });
    setAvatarPickerVisible(false);
  }

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your camera to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfile({ ...profile, profilePicture: result.assets[0].uri });
    }
  }

  async function handlePickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfile({ ...profile, profilePicture: result.assets[0].uri });
    }
  }

  function handleCancel() {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setBirthday(profile.birthday ?? '');
    setCurrency(profile.currency ?? 'USD');
    setIsEditing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.screen, styles.screenCenter]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screenHeaderRow}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>CashFlow</Text>
          <View style={styles.headerRightRow}>
            <Pressable onPress={toggleTheme} style={styles.themeToggleButton}>
              <Image
                source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Pressable>
            {!isEditing ? (
              <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.bodyAccent}>Edit</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleCancel} style={styles.editButton}>
                <Text style={styles.bodyMuted}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.screen}>

        <ScrollView contentContainerStyle={styles.scrollContentBottom} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.centerBlockMargin}>
              <Text style={[styles.h2, styles.labelMarginBottom]}>Profile</Text>
              <Pressable
                onPress={isEditing ? handlePickImage : undefined}
                disabled={!isEditing}
                style={{ opacity: isEditing ? 1 : 0.8 }}
              >
                {profile.profilePicture ? (
                  isEmojiAvatar(profile.profilePicture) ? (
                    <View style={styles.profileAvatarPlaceholder}>
                      <Text style={{ fontSize: 50 }}>
                        {getEmojiFromAvatar(profile.profilePicture)}
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: profile.profilePicture }}
                      style={styles.profileAvatar}
                    />
                  )
                ) : (
                  <View style={styles.profileAvatarPlaceholder}>
                    <Text style={styles.h2Large}>
                      {profile.firstName?.[0]?.toUpperCase() || profile.lastName?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </Pressable>
              {isEditing && (
                <Text style={styles.smallMutedTop}>Tap to change</Text>
              )}
            </View>

            <Text style={styles.h2Center}>Account Information</Text>

            {isEditing ? (
              <>
                <View style={styles.formFieldMargin}>
                  <Input
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.formFieldMargin}>
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.formFieldMargin}>
                  <Input label="Birthday"value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD" />
                </View>
                <View style={styles.formFieldMargin}>
                  <Text style={[styles.muted, styles.labelMarginBottom]}>Currency</Text>
                  <View style={styles.currencyRow}>
                    {CURRENCY_OPTIONS.map((code) => (
                      <Pressable key={code} onPress={() => setCurrency(code)} style={currency === code ? styles.currencyChipSelected : styles.currencyChip} >
                        <Text style={[styles.body, currency === code && styles.bodyAccent]}>
                          {code} {CURRENCIES[code]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {profile.firstName || profile.lastName ? (
                  <View style={styles.centerBlockMarginTop}>
                    <Text style={styles.muted}>Name</Text>
                    <Text style={[styles.body, styles.bodyTop4]}>
                      {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Not set'}
                    </Text>
                  </View>
                ) : null}
                {(profile.birthday ?? '').trim() ? (
                  <View style={styles.centerBlockMarginTop}>
                    <Text style={styles.muted}>Birthday</Text>
                    <Text style={[styles.body, styles.bodyTop4]}>{profile.birthday}</Text>
                  </View>
                ) : null}
                <View style={styles.centerBlockMarginTop}>
                  <Text style={styles.muted}>Currency</Text>
                  <Text style={[styles.body, styles.bodyTop4]}>
                    {profile.currency ?? 'USD'} {CURRENCIES[profile.currency ?? 'USD']}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.centerBlockMarginTop}>
              <Text style={styles.muted}>Username</Text>
              <Text style={[styles.body, styles.bodyTop4Muted]}>
                {session?.userId || 'Not available'}
              </Text>
            </View>

            <View style={styles.centerBlockMarginTop}>
              <Text style={styles.muted}>Email</Text>
              <Text style={[styles.body, styles.bodyTop4Muted]}>
                {session?.email || 'Not available'}
              </Text>
            </View>
          </View>

          {isEditing && (
            <View style={styles.formFieldMargin}>
              <Button
                title="Save Changes"
                onPress={handleSave}
                disabled={saving}
                loading={saving}
                variant="success"
              />
            </View>
          )}
        </ScrollView>
        </View>
      </SafeAreaView>
      <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      
      {/* Avatar Picker Modal */}
      <Modal visible={avatarPickerVisible} transparent animationType="slide" onRequestClose={() => setAvatarPickerVisible(false)} >
        <View style={avatarStyles.overlay}>
          <View style={[avatarStyles.container, { backgroundColor: colors.bg }]}>
            <View style={[avatarStyles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.h2, { color: colors.text }]}>Choose Avatar</Text>
              <Pressable onPress={() => setAvatarPickerVisible(false)}>
                <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={avatarStyles.grid}>
              {AVATARS.map((avatar) => (
                <Pressable
                  key={avatar.id}
                  style={[
                    avatarStyles.avatarOption,
                    { backgroundColor: colors.card, borderColor: colors.border },]}
                  onPress={() => handleSelectAvatar(avatar.id)} >
                  <Text style={avatarStyles.avatarEmoji}>{avatar.emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const avatarStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarEmoji: {
    fontSize: 36,
  },
});
