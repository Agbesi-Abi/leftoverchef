import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for testing
const DEMO_USER = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'password123',
};

const ONBOARDING_COMPLETE_KEY = '@auth:onboarding_complete';
const USER_STORAGE_KEY = '@auth:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on app startup
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);

      if (!userData) {
        router.replace('/sign-up');
      } else {
        setUser(JSON.parse(userData));
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      router.replace('/sign-in');
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const userData = {
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          email: DEMO_USER.email,
        };

        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true'); // Mark onboarding as complete for existing users
        setUser(userData);
        router.replace('/(tabs)'); // Go directly to tabs after sign in
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    }
  }

  async function signUp(name: string, email: string, password: string) {
    try {
      const userData = {
        id: Date.now().toString(),
        name,
        email,
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY); // Reset onboarding only for new users
      setUser(userData);
      router.replace('/onboarding'); // Show onboarding only for new users
    } catch (error) {
      throw error;
    }
  }

  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY); // Optional: clear onboarding
      setUser(null);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
