export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Modal: undefined;
};

declare global {
  namespace ReactNavigation {
    // Makes `useNavigation()` and `navigation.navigate(...)` strongly typed
    // across the app without needing generics everywhere.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

