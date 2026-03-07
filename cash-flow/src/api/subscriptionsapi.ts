const API_URL = "https://api.cashflowapi.dev";

export interface Subscription {
  id: number;
  name: string;
  amountPerMonth: number;
  startDate: string;
  isActive: boolean;
}


export async function deleteSubscription(subscriptionId: number) {
  const res = await fetch(`${API_URL}/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete subscription');

  return res.json();
}

export async function getSubscriptions(accountId: string) {
  const res = await fetch(`${API_URL}/subscriptions/${accountId}`);

  if (!res.ok) throw new Error('Failed to fetch subscriptions');

  const data = await res.json();

  return data.map((row: any) => ({
    id: row.subscription_id,
    name: row.subscription_name,
    amountPerMonth: Number(row.amount_per_month),
    startDate: row.start_date,
    isActive: row.is_active,
  }));
}


type AddSubscriptionData = {
  name: string;
  amountPerMonth: number;
  startDate?: string;
};

export async function addSubscription(
  accountId: string,
  data: AddSubscriptionData
) {
  const res = await fetch(`${API_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId,
      ...data,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to add subscription');
  }

  return res.json();
}


export async function deactivateSubscription(subscriptionId: string) {
  const res = await fetch(
    `${API_URL}/subscriptions/${subscriptionId}/deactivate`,
    {
      method: 'PATCH',
    }
  );

  if (!res.ok) {
    throw new Error('Failed to deactivate subscription');
  }

  return res.json();
}

export async function toggleSubscriptionActive(
  subscriptionId: number,
  isActive: boolean
) {
  const res = await fetch(`${API_URL}/subscriptions/${subscriptionId}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) throw new Error('Failed to update subscription');

  const row = await res.json();

  return {
    id: row.subscription_id,
    name: row.subscription_name,
    amountPerMonth: Number(row.amount_per_month),
    startDate: row.start_date,
    isActive: row.is_active,
  };
}