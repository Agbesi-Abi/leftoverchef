import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StatsData {
  recipesViewed: number;
  recipesSaved: number;
  mealsMade: number;
  ingredientsSaved?: number;
  ingredientsUsed?: number;
  recipesCreated?: number;
  recipesShared?: number;
  recipesReviewed?: number;
  recipesCooked?: number;
  recipesCookedWithLeftovers?: number;
  recipesCookedWithFresh?: number;
  recipesCookedWithFrozen?: number;
}

interface StatsContextType {
  stats: StatsData;
  incrementRecipesViewed: (count?: number) => void;
  incrementRecipesSaved: () => void;
  incrementMealsMade: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

interface StatsProviderProps {
  children: ReactNode;
}

const STATS_STORAGE_KEY = '@LeftoverChef:stats';

export function StatsProvider({ children }: StatsProviderProps) {
  const [stats, setStats] = useState<StatsData>({
    recipesViewed: 0,
    recipesSaved: 0,
    mealsMade: 0,
  });

  // Load stats from storage on initial render
  useEffect(() => {
    async function loadStats() {
      try {
        const storedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
        if (storedStats) {
          setStats(JSON.parse(storedStats));
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }

    loadStats();
  }, []);

  // Save stats to storage whenever they change
  useEffect(() => {
    async function saveStats() {
      try {
        await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
      } catch (error) {
        console.error('Error saving stats:', error);
      }
    }

    saveStats();
  }, [stats]);

  const incrementRecipesViewed = useCallback((count = 1) => {
    setStats(prev => ({
      ...prev,
      recipesViewed: prev.recipesViewed + count
    }));
  }, []);

  const incrementRecipesSaved = useCallback(() => {
    setStats(prev => ({
      ...prev,
      recipesSaved: prev.recipesSaved + 1
    }));
  }, []);

  const incrementMealsMade = useCallback(() => {
    setStats(prev => ({
      ...prev,
      mealsMade: prev.mealsMade + 1
    }));
  }, []);

  const value = {
    stats,
    incrementRecipesViewed,
    incrementRecipesSaved,
    incrementMealsMade,
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}