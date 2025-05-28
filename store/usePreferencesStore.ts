import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';

export const usePreferencesStore = create(
  persist(
    (set) => ({
      theme: 'light',
      notificationsEnabled: true,
      language: 'en',

      // Actions
      toggleTheme: () =>
        set((state: { theme: string; }) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleNotifications: () =>
        set((state: { notificationsEnabled: any; }) => ({ notificationsEnabled: !state.notificationsEnabled })),
      setLanguage: (lang: any) => set(() => ({ language: lang })),
    }),
    {
      name: 'preferences-storage', // AsyncStorage key
      getStorage: () => AsyncStorage,
    }
  )
);
