import { STORAGE_KEYS } from '../storage/keys';
import { readJson, writeJson } from '../storage/storage';
import { monthKey, isoDate } from '../utils/date';

export interface Category {
  id: string;
  name: string;
  limit?: number;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  note?: string;
  dateIso: string;
  createdAt: string;
}

export interface Month {
  income: number;
  categories: Category[];
  expenses: Expense[];
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate?: string;
  createdAt: string;
}

interface UserData {
  months: Record<string, Month>;
  subscriptions?: Subscription[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining' },
  { id: 'transport', name: 'Transportation' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'health', name: 'Health' },
  { id: 'other', name: 'Other' },
];

function userKey(userId: string): string {
  return `${STORAGE_KEYS.dataPrefix}${userId}`;
}

function emptyMonth(): Month {
  return {
    income: 0,
    categories: [...DEFAULT_CATEGORIES],
    expenses: [],
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function getMonthData(userId: string, mKey: string = monthKey()): Promise<{ all: UserData; month: Month }> {
  const all = await readJson<UserData>(userKey(userId), { months: {} });
  let month = all.months?.[mKey];
  
 
  if (!month) {
    month = emptyMonth();
  } else if (!month.categories || month.categories.length === 0) {
    month.categories = [...DEFAULT_CATEGORIES];
  }
  
  return { all, month };
}

export async function getYearData(userId: string, year: string): Promise<{ months: Record<string, Month> }> {
  const all = await readJson<UserData>(userKey(userId), { months: {} });
  const yearMonths: Record<string, Month> = {};
  for (let m = 1; m <= 12; m++) {
    const mKey = `${year}-${String(m).padStart(2, '0')}`;
    if (all.months[mKey]) yearMonths[mKey] = all.months[mKey];
  }
  return { months: yearMonths };
}

export async function addExpense(
  userId: string,
  expense: { amount: number; categoryId: string; note?: string; dateIso?: string }
): Promise<Expense> {
  const mKey = monthKey();
  const { all, month } = await getMonthData(userId, mKey);
  
  const newExpense: Expense = {
    id: generateId(),
    amount: expense.amount,
    categoryId: expense.categoryId,
    note: expense.note,
    dateIso: expense.dateIso || isoDate(),
    createdAt: new Date().toISOString(),
  };
  
  month.expenses.push(newExpense);
  all.months[mKey] = month;
  
  await writeJson(userKey(userId), all);
  return newExpense;
}

export async function updateIncome(userId: string, income: number): Promise<void> {
  const mKey = monthKey();
  const { all, month } = await getMonthData(userId, mKey);
  
  month.income = income;
  all.months[mKey] = month;
  
  await writeJson(userKey(userId), all);
}

export async function getCategories(userId: string): Promise<Category[]> {
  const { month } = await getMonthData(userId);
  return month.categories;
}

// Delete functions
export async function deleteExpense(userId: string, expenseId: string, mKey: string = monthKey()): Promise<void> {
  const { all, month } = await getMonthData(userId, mKey);
  month.expenses = month.expenses.filter(e => e.id !== expenseId);
  all.months[mKey] = month;
  await writeJson(userKey(userId), all);
}

export async function deleteSubscription(userId: string, subscriptionId: string): Promise<void> {
  const all = await readJson<UserData>(userKey(userId), { months: {}, subscriptions: [] });
  all.subscriptions = (all.subscriptions || []).filter(s => s.id !== subscriptionId);
  await writeJson(userKey(userId), all);
}

export async function clearBudgetLimit(userId: string, categoryId: string): Promise<void> {
  const mKey = monthKey();
  const { all, month } = await getMonthData(userId, mKey);
  const categoryIndex = month.categories.findIndex(c => c.id === categoryId);
  if (categoryIndex >= 0) {
    month.categories[categoryIndex].limit = undefined;
  }
  all.months[mKey] = month;
  await writeJson(userKey(userId), all);
}

// Budget limit functions
export async function saveBudgetLimit(
  userId: string,
  categoryId: string,
  limit: number
): Promise<void> {
  const mKey = monthKey();
  const { all, month } = await getMonthData(userId, mKey);
  
  const categoryIndex = month.categories.findIndex(c => c.id === categoryId);
  if (categoryIndex >= 0) {
    month.categories[categoryIndex].limit = limit;
  }
  
  all.months[mKey] = month;
  await writeJson(userKey(userId), all);
}

export async function getCategoriesWithSpent(userId: string): Promise<(Category & { spent: number })[]> {
  const { month } = await getMonthData(userId);
  
  return month.categories.map(category => {
    const spent = month.expenses
      .filter(e => e.categoryId === category.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...category, spent };
  });
}

// Subscription functions
export async function addSubscription(
  userId: string,
  subscription: { name: string; amount: number; billingCycle: 'weekly' | 'monthly' | 'yearly'; nextBillingDate?: string }
): Promise<Subscription> {
  const all = await readJson<UserData>(userKey(userId), { months: {}, subscriptions: [] });
  
  const newSubscription: Subscription = {
    id: generateId(),
    name: subscription.name,
    amount: subscription.amount,
    billingCycle: subscription.billingCycle,
    nextBillingDate: subscription.nextBillingDate,
    createdAt: new Date().toISOString(),
  };
  
  if (!all.subscriptions) {
    all.subscriptions = [];
  }
  all.subscriptions.push(newSubscription);
  
  await writeJson(userKey(userId), all);
  return newSubscription;
}

export async function getSubscriptions(userId: string): Promise<Subscription[]> {
  const all = await readJson<UserData>(userKey(userId), { months: {}, subscriptions: [] });
  return all.subscriptions || [];
}
