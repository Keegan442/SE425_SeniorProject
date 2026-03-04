export interface Avatar {
  id: string;
  emoji: string;
  label: string;
}

export const AVATARS: Avatar[] = [
  { id: 'smile', emoji: '😊', label: 'Smile' },
  { id: 'cool', emoji: '😎', label: 'Cool' },
  { id: 'star', emoji: '🌟', label: 'Star' },
  { id: 'heart', emoji: '💜', label: 'Heart' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'money', emoji: '💰', label: 'Money' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'dog', emoji: '🐶', label: 'Dog' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'plant', emoji: '🌱', label: 'Plant' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'moon', emoji: '🌙', label: 'Moon' },
];

export function isEmojiAvatar(profilePicture: string | null): boolean {
  return profilePicture?.startsWith('emoji:') ?? false;
}

export function getEmojiFromAvatar(profilePicture: string | null): string | null {
  if (!profilePicture?.startsWith('emoji:')) return null;
  const id = profilePicture.replace('emoji:', '');
  const avatar = AVATARS.find(a => a.id === id);
  return avatar?.emoji ?? null;
}

export function createAvatarString(id: string): string {
  return `emoji:${id}`;
}
