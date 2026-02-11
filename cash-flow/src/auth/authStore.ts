import { STORAGE_KEYS } from '../storage/keys';
import { readJson, removeKey, writeJson } from '../storage/storage';

export interface Session {
  userId: string;
  email: string;
}

const API_URL = 'http://192.168.0.67:3000'; 

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

export async function getSession(): Promise<Session | null> {
  return await readJson<Session | null>(STORAGE_KEYS.session, null);
}

export async function signOut(): Promise<void> {
  await removeKey(STORAGE_KEYS.session);
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  firstName: string,
  lastName: string,
  birthday: string
): Promise<Session> {
  try {
    const e = normalizeEmail(email);

    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
        password,
        username,
        firstName,
        lastName,
        birthday,
       })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to sign up');
    }

    const data = await res.json();

    const session: Session = {
      userId: String(data.user.accountId),
      email: e
    };

    await writeJson(STORAGE_KEYS.session, session);
    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign up');
  }
}

export async function signIn(identifier: string, password: string): Promise<Session> {
  try {
    const e = normalizeEmail(identifier);

    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: e, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to sign in');
    }

    const data = await res.json();

    const session: Session = {
      userId: String(data.user.accountId),
      email: e
    };

    await writeJson(STORAGE_KEYS.session, session);
    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign in');
  }
}