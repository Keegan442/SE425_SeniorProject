import { STORAGE_KEYS } from '../storage/keys';
import { readJson, removeKey, writeJson } from '../storage/storage';
import { uid } from '../utils/id';

export interface Session {
  userId: string;
  email: string;
}

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

export async function getSession(): Promise<Session | null> {
  return await readJson<Session | null>(STORAGE_KEYS.session, null);
}

export async function signOut(): Promise<void> {
  await removeKey(STORAGE_KEYS.session);
}

export async function signUp(email: string, password: string): Promise<Session> {
  // Mock auth (temporary): accept any email/password and create a session.
  try {
    const e = normalizeEmail(email) || 'guest@example.com';
    const session: Session = { userId: uid('u'), email: e };
    await writeJson(STORAGE_KEYS.session, session);
    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign up');
  }
}

export async function signIn(email: string, password: string): Promise<Session> {
  // Mock auth (temporary): accept any email/password and create a session.
  // We keep the email for display; password is ignored.
  try {
    const e = normalizeEmail(email) || 'guest@example.com';
    const session: Session = { userId: uid('u'), email: e };
    await writeJson(STORAGE_KEYS.session, session);
    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to sign in');
  }
}
