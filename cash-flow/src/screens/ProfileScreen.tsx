import { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, View, Image, Alert, Pressable, ActivityIndicator } from 'react-native';
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

export default function ProfileScreen() {
  const { session } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const colors = getColors(theme);
  const styles = getAppStyles(colors);
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ firstName: '', lastName: '', profilePicture: null });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

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
      };
      await saveUserProfile(session.userId, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
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
    setIsEditing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 8, paddingBottom: 4 }}>
          <MenuButton onPress={() => setMenuVisible(true)} />
          <Text style={styles.title}>CashFlow</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Pressable
              onPress={toggleTheme}
              style={{ padding: spacing.xs, alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                source={theme === 'dark' ? require('../../assets/images/DarkLogo.png') : require('../../assets/images/LightLogo.png')}
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
              />
            </Pressable>
            {!isEditing ? (
              <Pressable
                onPress={() => setIsEditing(true)}
                style={{ padding: spacing.xs, minWidth: 32 }}
              >
                <Text style={[styles.body, { color: colors.accent }]}>Edit</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleCancel}
                style={{ padding: spacing.xs, minWidth: 32 }}
              >
                <Text style={[styles.body, { color: colors.muted }]}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.screen}>

        <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={[styles.h2, { marginBottom: spacing.md }]}>Profile</Text>
              <Pressable
                onPress={isEditing ? handlePickImage : undefined}
                disabled={!isEditing}
                style={{ opacity: isEditing ? 1 : 0.8 }}
              >
                {profile.profilePicture ? (
                  <Image
                    source={{ uri: profile.profilePicture }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: colors.card,
                      borderWidth: 2,
                      borderColor: colors.border,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: colors.card,
                      borderWidth: 2,
                      borderColor: colors.border,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={[styles.h2, { fontSize: 40 }]}>
                      {profile.firstName?.[0]?.toUpperCase() || profile.lastName?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </Pressable>
              {isEditing && (
                <Text style={[styles.smallMuted, { marginTop: spacing.xs }]}>Tap to change</Text>
              )}
            </View>

            <Text style={[styles.h2, { textAlign: 'center' }]}>Account Information</Text>

            {isEditing ? (
              <>
                <View style={{ marginTop: spacing.md }}>
                  <Input
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ marginTop: spacing.md }}>
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    autoCapitalize="words"
                  />
                </View>
              </>
            ) : (
              <>
                {profile.firstName || profile.lastName ? (
                  <>
                    <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
                      <Text style={styles.muted}>Name</Text>
                      <Text style={[styles.body, { marginTop: 4 }]}>
                        {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Not set'}
                      </Text>
                    </View>
                  </>
                ) : null}
              </>
            )}

            <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Text style={styles.muted}>Username</Text>
              <Text style={[styles.body, { marginTop: 4, opacity: 0.6 }]}>
                {session?.userId || 'Not available'}
              </Text>
            </View>

            <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
              <Text style={styles.muted}>Email</Text>
              <Text style={[styles.body, { marginTop: 4, opacity: 0.6 }]}>
                {session?.email || 'Not available'}
              </Text>
            </View>
          </View>

          {isEditing && (
            <View style={{ marginTop: spacing.md }}>
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
    </>
  );
}
