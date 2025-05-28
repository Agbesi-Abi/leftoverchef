import { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { router } from 'expo-router';
import RecipeCard from '@/components/RecipeCard';
import colors from '@/constant/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import React from 'react';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import debounce = require('lodash/debounce');

type Recipe = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
};

export default function AllRecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fetchRecipes = useCallback(async () => {
    try {
      // Fetch recipes from multiple categories
      const categories = ['Beef', 'Chicken', 'Seafood', 'Vegetarian'];
      const allRecipes = await Promise.all(
        categories.map(category =>
          fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
            .then(res => res.json())
            .then(data => data.meals || [])
        )
      );

      // Flatten and shuffle the recipes array
      const flattenedRecipes = allRecipes.flat();
      const shuffledRecipes = flattenedRecipes
        .sort(() => Math.random() - 0.5)
        .slice(0, 20); // Limit to 20 recipes

      setRecipes(shuffledRecipes);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecipes();
  }, [fetchRecipes]);

  React.useEffect(() => {
    fetchRecipes();
  }, []);

  // Add search filter function
  const filteredRecipes = recipes.filter(recipe => 
    recipe.strMeal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        setIsSearching(true);
        try {
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
          );
          const data = await response.json();
          if (data.meals) {
            setRecipes(data.meals);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      }, 500),
    []
  );

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      debouncedSearch(text);
    } else if (text.length === 0) {
      fetchRecipes(); // Reset to original recipes
    }
  }, [debouncedSearch, fetchRecipes]);

  const renderRecipe = useCallback(({ item, index }: { item: Recipe; index: number }) => (
    <Animated.View
      key={`recipe-${item.idMeal}`}
      entering={FadeInDown.delay(index * 100)}
      style={styles.recipeContainer}
    >
      <RecipeCard
        recipe={item}
        onPress={() => router.push(`/(recipe)/${item.idMeal}`)}
      />
    </Animated.View>
  ), []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          {showSearch ? (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Search size={20} color={colors.textLight} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search recipes..."
                  placeholderTextColor={colors.textLight}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => handleSearch('')}
                  >
                    <X size={16} color={colors.textLight} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity 
                style={styles.searchCloseButton}
                onPress={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  fetchRecipes();
                }}
              >
                <Text style={styles.searchCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>All Recipes</Text>
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Search size={24} color={colors.text} />
              </TouchableOpacity>
            </>
          )}
        </View>
        {!showSearch && (
          <Text style={styles.subtitle}>
            Discover our collection of delicious recipes
          </Text>
        )}
      </View>

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipe}
        keyExtractor={item => item.idMeal}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  searchCloseButton: {
    marginLeft: 12,
    padding: 8,
  },
  searchCloseText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textLight,
    marginBottom: 24,
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  recipeContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
});