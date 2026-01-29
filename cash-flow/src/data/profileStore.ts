import { STORAGE_KEYS } from '../storage/keys';
import { readJson, writeJson } from '../storage/storage';

export interface UserProfile {
  firstName: string;
  lastName: string;
  profilePicture: string | null; // URI or base64 string
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const key = `${STORAGE_KEYS.dataPrefix}profile_${userId}`;
  const profile = await readJson<UserProfile | null>(key, null);
  return profile || { firstName: '', lastName: '', profilePicture: null };
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const key = `${STORAGE_KEYS.dataPrefix}profile_${userId}`;
  await writeJson(key, profile);
}
