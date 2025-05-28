import { Recipe } from '@/types';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const FETCH_TIMEOUT = 10000; // 10 seconds timeout

// Helper function to handle fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

// Search for meals by main ingredient
export async function searchMealsByIngredient(ingredient: string): Promise<Recipe[]> {
  try {
    console.log(`Searching for meals with ingredient: ${ingredient}`);
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`
    );
    
    const data = await response.json();
    
    // TheMealDB returns null if no meals are found
    if (!data.meals) {
      console.log('No meals found for ingredient:', ingredient);
      return [];
    }
    
    // The filtered results don't include full details, so we need to fetch each meal
    console.log(`Found ${data.meals.length} meals, fetching details...`);
    const recipePromises = data.meals.map((meal: any) => getMealById(meal.idMeal));
    return Promise.all(recipePromises);
    
  } catch (error) {
    console.error('Error searching meals by ingredient:', {
      ingredient,
      error: error.message,
      stack: error.stack,
      type: error.name
    });
    return [];
  }
}

// Get detailed information about a meal by ID
export async function getMealById(id: string): Promise<Recipe> {
  try {
    console.log(`Fetching meal details for ID: ${id}`);
    const response = await fetchWithTimeout(`${API_BASE_URL}/lookup.php?i=${id}`);
    
    const data = await response.json();
    
    if (!data.meals || data.meals.length === 0) {
      throw new Error('Meal not found');
    }
    
    const meal = data.meals[0];
    
    // Transform API response to our Recipe type
    return {
      id: meal.idMeal,
      strMeal: meal.strMeal,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
      strInstructions: meal.strInstructions,
      strMealThumb: meal.strMealThumb,
      strTags: meal.strTags,
      strYoutube: meal.strYoutube,
      // Include all ingredients and measures
      ...Object.fromEntries(
        Object.entries(meal).filter(([key]) => 
          key.startsWith('strIngredient') || key.startsWith('strMeasure')
        )
      )
    };
    
  } catch (error) {
    console.error('Error getting meal by ID:', {
      id,
      error: error.message,
      stack: error.stack,
      type: error.name
    });
    throw error;
  }
}

// Get random meal
export async function getRandomMeal(): Promise<Recipe> {
  try {
    console.log('Fetching random meal');
    const response = await fetchWithTimeout(`${API_BASE_URL}/random.php`);
    
    const data = await response.json();
    
    if (!data.meals || data.meals.length === 0) {
      throw new Error('Failed to get random meal');
    }
    
    const meal = data.meals[0];
    
    return {
      id: meal.idMeal,
      strMeal: meal.strMeal,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
      strInstructions: meal.strInstructions,
      strMealThumb: meal.strMealThumb,
      strTags: meal.strTags,
      strYoutube: meal.strYoutube,
      // Include all ingredients and measures
      ...Object.fromEntries(
        Object.entries(meal).filter(([key]) => 
          key.startsWith('strIngredient') || key.startsWith('strMeasure')
        )
      )
    };
    
  } catch (error) {
    console.error('Error getting random meal:', {
      error: error.message,
      stack: error.stack,
      type: error.name
    });
    throw error;
  }
}