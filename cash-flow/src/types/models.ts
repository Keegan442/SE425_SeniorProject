export type Expense = {
  id: string;
  amount: number;
  categoryId: string;
  note?: string;
  dateIso: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  type: 'income' | 'expense';
};

export type Subscription = {
  id: number;
  name: string;
  amountPerMonth: number;
  startDate: string;
  isActive: boolean;
};

export type Budget = {
  id: number;
  categoryId: string;
  amount: number;
  monthKey: string;
};