import { STORAGE_KEYS } from '../storage/keys';
import { readJson } from '../storage/storage';
import { monthKey } from '../utils/date';

interface Category {
  id: string;
  name: string;
  limit?: number;
}

interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  dateIso: string;
  createdAt: string;
}

interface Month {
  income: number;
  categories: Category[];
  expenses: Expense[];
}

interface UserData {
  months: Record<string, Month>;
}

function userKey(userId: string): string {
  return `${STORAGE_KEYS.dataPrefix}${userId}`;
}

function emptyMonth(): Month {
  return {
    income: 0,
    categories: [],
    expenses: [],
  };
}

export async function getMonthData(userId: string, mKey: string = monthKey()): Promise<{ all: UserData; month: Month }> {
  const all = await readJson<UserData>(userKey(userId), { months: {} });
  const month = all.months?.[mKey] || emptyMonth();
  return { all, month };
}
