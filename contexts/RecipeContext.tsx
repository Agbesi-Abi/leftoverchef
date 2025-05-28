import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { searchMealsByIngredient } from '@/services/api';
import { Recipe } from '@/types';

interface RecipeContextType {
  ingredients: string[];
  recipes: Recipe[];
  loading: boolean;
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
  searchRecipes: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

interface RecipeProviderProps {
  children: ReactNode;
}

export function RecipeProvider({ children }: RecipeProviderProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const addIngredient = useCallback((ingredient: string) => {
    // Convert to lowercase for comparison
    const normalizedIngredient = ingredient.toLowerCase();
    
    setIngredients(prev => {
      // Check if ingredient already exists (case-insensitive)
      const exists = prev.some(
        item => item.toLowerCase() === normalizedIngredient
      );
      
      if (exists) return prev;
      
      // Add with original casing
      return [...prev, ingredient];
    });
  }, []);

  const removeIngredient = useCallback((ingredient: string) => {
    setIngredients(prev => prev.filter(item => item !== ingredient));
  }, []);

  const clearIngredients = useCallback(() => {
    setIngredients([]);
  }, []);

  const searchRecipes = useCallback(async () => {
    if (ingredients.length === 0) return;
    
    setLoading(true);
    try {
      const mainIngredient = ingredients[0]; // Use first ingredient as main search term
      const results = await searchMealsByIngredient(mainIngredient);
      
      // Filter results by other ingredients if there are more than one
      if (ingredients.length > 1) {
        const otherIngredients = ingredients.slice(1).map(ing => ing.toLowerCase());
        
        // Filter recipes that have at least one of the other ingredients
        const filteredResults = results.filter(recipe => {
          // Get all ingredients from recipe
          const recipeIngredients: string[] = [];
          for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}` as keyof Recipe] as string;
            if (ing && ing.trim() !== '') {
              recipeIngredients.push(ing.toLowerCase());
            }
          }
          
          // Check if any other ingredient is in the recipe
          return otherIngredients.some(ing => 
            recipeIngredients.some(recipeIng => recipeIng.includes(ing))
          );
        });
        
        setRecipes(filteredResults);
      } else {
        setRecipes(results);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [ingredients]);

  const value = {
    ingredients,
    recipes,
    loading,
    addIngredient,
    removeIngredient,
    clearIngredients,
    searchRecipes,
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
}