import type { Expense, Subscription, Category } from '../data/budgetStore';

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
  TransactionDetail: { expense: Expense; categoryName: string; monthKey: string };
  SubscriptionDetail: { subscription: Subscription };
  BudgetDetail: { category: Category & { spent: number } };
};

declare global {
  namespace ReactNavigation {

    interface RootParamList extends RootStackParamList {}
  }
}

