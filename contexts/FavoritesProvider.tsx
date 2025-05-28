
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/types';
import React from 'react';

interface FavoritesContextType {
  favorites: Recipe[];
  addFavorite: (recipe: Recipe) => void;
  removeFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

const FAVORITES_STORAGE_KEY = '@LeftoverChef:favorites';

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  // Load favorites from storage on initial render
  useEffect(() => {
    async function loadFavorites() {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }

    loadFavorites();
  }, []);

  // Save favorites to storage whenever they change
  useEffect(() => {
    async function saveFavorites() {
      try {
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }

    if (favorites.length > 0) {
      saveFavorites();
    }
  }, [favorites]);

  const addFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev => {
      // Check if already exists
      if (prev.some(item => item.id === recipe.id)) {
        return prev;
      }
      return [...prev, recipe];
    });
  }, []);

  const removeFavorite = useCallback((recipeId: string) => {
    setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
  }, []);

  const isFavorite = useCallback((recipeId: string) => {
    return favorites.some(recipe => recipe.id === recipeId);
  }, [favorites]);

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}