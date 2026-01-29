interface Expense {
  amount: number | string;
}

export function sumExpenses(expenses: Expense[] | null | undefined): number {
  return (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
}
