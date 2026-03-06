const API_URL = "http://ec2-3.137.201.93.compute-1.amazonaws.com:3000";
import { Session } from '../auth/authStore';

export type UserProfile = {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  birthday: string | null;
  currency: string;
  username: string;  
  email: string; 
};

export async function getUserProfile(accountId: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/profile/${accountId}`);

  if (!res.ok) {
    throw new Error('Failed to load profile');
  }

  const data = await res.json();

  return {
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    profilePicture: null,
    birthday: data.birthday ?? null,
    currency: data.currency ?? 'USD',
    username: data.username ?? '',
    email: data.email ?? '',
  };
}

export async function saveUserProfile(session: Session, profile: UserProfile) {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'POST',  // not PUT
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId: session.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthday: profile.birthday?.slice(0, 10) || null,
      username: profile.username,
      email: session.email,          
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to save profile');
  }

  return res.json();
}