const API_URL = 'http://192.168.0.67:3000';

export interface Budget {
  budgetId: number;
  accountId: number;
  categoryId: number;
  limitAmount: number;
  startDate: string;
  finishDate: string;
  isActive: boolean;
  createdAt: string;
}

export async function getBudgets(accountId: string): Promise<Budget[]> {
  const res = await fetch(`${API_URL}/budgets/${accountId}`);
  if (!res.ok) throw new Error('Failed to fetch budgets');

  const data = await res.json();
  return data.map((row: any) => ({
    budgetId: row.budget_id,
    accountId: row.account_id,
    categoryId: row.category_id,
    limitAmount: Number(row.limit_amount),
    startDate: row.start_date,
    finishDate: row.finish_date,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
}

export async function addBudget(
  accountId: string,
  categoryId: number,
  limitAmount: number,
  startDate: string,
  finishDate: string
) {
  const res = await fetch(`${API_URL}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, categoryId, limitAmount, startDate, finishDate }),
  });
  if (!res.ok) throw new Error('Failed to add budget');
  return res.json();
}

export async function deleteBudget(budgetId: number) {
  const res = await fetch(`${API_URL}/budgets/${budgetId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete budget');
  return res.json();
}

export async function toggleBudgetActive(budgetId: number, isActive: boolean) {
  const res = await fetch(`${API_URL}/budgets/${budgetId}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error('Failed to update budget');
  return res.json();
}