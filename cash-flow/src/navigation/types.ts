import type { Expense, Subscription, Category } from '../types/models';
import { Budget } from '../api/budgetsApi';

export type BudgetWithMeta = Budget & {
  categoryName: string;
  spent: number;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Modal: undefined;
  Profile: undefined;
  Downloads: undefined;
  Budgets: undefined;
  Subscriptions: undefined;
  Transactions: undefined;
  AddTransaction: undefined;
  AddBudget: undefined;
  AddSubscription: undefined;
  AddIncome: undefined;
  AddCategory: undefined;
  TransactionDetail: { expense: Expense; categoryName: string; monthKey: string };
  SubscriptionDetail: { subscription: Subscription };
  BudgetDetail: { budget: BudgetWithMeta };
};

declare global {
  namespace ReactNavigation {

    interface RootParamList extends RootStackParamList {}
  }
}

