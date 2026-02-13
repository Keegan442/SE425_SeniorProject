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
};

declare global {
  namespace ReactNavigation {

    interface RootParamList extends RootStackParamList {}
  }
}

