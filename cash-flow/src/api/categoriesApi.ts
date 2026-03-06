const API_URL = "http://ec2-3.137.201.93.compute-1.amazonaws.com:3000";

export async function getCategories(accountId: string) {
  const res = await fetch(`${API_URL}/categories/${accountId}`);

  if (!res.ok) throw new Error('Failed to fetch categories');

  return res.json();
}

export async function addCategory(
  accountId: string,
  name: string,
  description: string | undefined,
  type: 'income' | 'expense'
) {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      name,
      description,
      type,
    }),
  });

  if (!res.ok) throw new Error('Failed to add category');

  return res.json();
}