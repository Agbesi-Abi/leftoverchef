export interface Recipe {
  idMeal: any;
  category: string;
  id: string;
  title: string;
  thumbnail: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  key?: string;
  strTags?: string;
  strYoutube?: string;
  ingredients: Ingredient[];
  measures: string[];
  strSource?: string;
  strImageSource?: string;
  strIngredient1?: string;
}

export interface MealDBResponse {
  meals: MealDBMeal[];
}

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface RecipeSearchResult {
  id: string;
  title: string;
  thumbnail: string;
}

export interface Ingredient {
  name: string;
  measure: string;
}

export interface MealPlan {
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: (stats: any) => boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface ShoppingItem {
  id: string;
  name: string;
  measure: string;
  checked: boolean;
  category: string;
}

export interface ShoppingListByCategory {
  [category: string]: ShoppingItem[];
}