import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
