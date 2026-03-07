const API_URL = "https://api.cashflowapi.dev";

export async function getTransactions(
  accountId: string,
  month: string
) {
  const res = await fetch(
    `${API_URL}/transactions/${accountId}?month=${month}`
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to fetch transactions');
  }

  return res.json();
}

export async function addTransaction(
  accountId: string,
  amount: number,
  categoryId: string,
  note: string | undefined,
  dateIso: string
) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      amount,
      categoryId,
      note,
      dateIso,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to add transaction');
  }

  return res.json();
}

export async function deleteTransaction(transactionId: string) {
  const res = await fetch(
    `${API_URL}/transactions/${transactionId}`,
    { method: 'DELETE' }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to delete transaction');
  }
}