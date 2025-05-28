export type AuthStackParamList = {
  'sign-in': undefined;
  'sign-up': undefined;
};

export type TabsParamList = {
  index: undefined;
  profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList, TabsParamList {}
  }
}