import { STORAGE_KEYS } from '../storage/keys';
import { readJson, writeJson } from '../storage/storage';

export interface UserProfile {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  birthday: string | null;
  currency: string;
}

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  profilePicture: null,
  birthday: null,
  currency: 'USD',
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const key = `${STORAGE_KEYS.dataPrefix}profile_${userId}`;
  const profile = await readJson<UserProfile | null>(key, null);
  return profile ? { ...defaultProfile, ...profile } : { ...defaultProfile };
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const key = `${STORAGE_KEYS.dataPrefix}profile_${userId}`;
  await writeJson(key, profile);
}
