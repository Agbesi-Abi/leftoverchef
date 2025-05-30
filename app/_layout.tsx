import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { RecipeProvider } from '@/contexts/RecipeContext';
import { FavoritesProvider } from '@/contexts/FavoritesProvider';
import { StatsProvider } from '@/contexts/StatsProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <RecipeProvider>
        <FavoritesProvider>
          <StatsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" redirect/>
              <Stack.Screen 
                name="sign-in" 
                options={{ animation: 'none' }}
              />
              <Stack.Screen 
                name="sign-up" 
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen 
                name="(tabs)" 
                options={{ animation: 'fade' }}
              />
              <Stack.Screen 
                name="onboarding" 
                options={{ animation: 'fade' }}
              />
              <Stack.Screen 
                name="badges" 
                options={{ animation: 'fade' }}
              />
              <Stack.Screen 
                name="meal-planner" 
                options={{ animation: 'fade' }}
              />
              <Stack.Screen 
                name="recipe/[id]" 
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen 
                name="+not-found" 
                options={{ animation: 'fade' }}
              />
            </Stack>
            <StatusBar style="auto" />
          </StatsProvider>
        </FavoritesProvider>
      </RecipeProvider>
    </AuthProvider>
  );
}