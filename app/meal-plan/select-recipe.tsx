import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Keyboard,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Search, X } from "lucide-react-native";
import colors from "@/constant/colors";
import { searchMealsByIngredient } from "@/services/api";
import { RecipeSearchResult, Recipe, MealType } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import { useMealPlanStore } from "@/store/useMealPlanStore";
import { useFavorites } from "@/contexts/FavoritesProvider";
import EmptyState from "@/components/EmptyState";
import { debounce } from "lodash";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const normalizeRecipe = (recipe: any): Recipe => ({
    id: recipe.idMeal || recipe.id,
    title: recipe.strMeal || recipe.title || "Untitled Recipe",
    thumbnail: recipe.strMealThumb || recipe.thumbnail || "",
    strMeal: recipe.strMeal || recipe.title || "Untitled Recipe",
    strCategory: recipe.strCategory || "",
    strArea: recipe.strArea || "",
    strInstructions: recipe.strInstructions || "",
    strMealThumb: recipe.strMealThumb || recipe.thumbnail || "",
    ingredients: [],
    measures: []
});

export default function SelectRecipeScreen() {
  const params = useLocalSearchParams<{ date: string; mealType: string }>();
  const router = useRouter();
  const { addMeal } = useMealPlanStore();
  const { favorites } = useFavorites();

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "favorites">("favorites");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const valid = params.date && params.mealType && MEAL_TYPES.includes(params.mealType.toLowerCase());
    if (!valid) {
      console.error("Invalid parameters");
      router.back();
    }
  }, [params]);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) return;
      setIsLoading(true);
      Keyboard.dismiss();
      try {
        const results = await searchMealsByIngredient(query);
        const mapped = Array.isArray(results) ? results.map(normalizeRecipe) : [];
        setSearchResults(mapped);
        setActiveTab("search");
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  const handleSearch = () => debouncedSearch(searchQuery);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setActiveTab("favorites");
  };

  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
  }, []);

  const handleAddMeal = useCallback(() => {
    if (!selectedRecipe || !params.date || !params.mealType) {
      console.error('Missing required data for adding meal');
      return;
    }

    try {
      addMeal(
        params.date,
        params.mealType.toLowerCase() as MealType,
        selectedRecipe
      );
      router.back();
    } catch (error) {
      console.error('Failed to add meal:', error);
      Alert.alert('Error', 'Failed to add meal. Please try again.');
    }
  }, [selectedRecipe, params.date, params.mealType, addMeal, router]);

  const normalizedFavorites = favorites.map(normalizeRecipe);

  const renderRecipeItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedRecipe(selectedRecipe?.id === item.id ? null : item);
        }}
        style={[
          styles.recipeItemContainer,
          selectedRecipe?.id === item.id && styles.selectedRecipeContainer
        ]}
      >
        <RecipeCard
          recipe={item}
          compact={activeTab === "search"}
          isSelected={selectedRecipe?.id === item.id}
        />
      </TouchableOpacity>
    ),
    [activeTab, selectedRecipe]
  );

  const listData = activeTab === "favorites" ? normalizedFavorites : searchResults;
  const isEmpty = listData.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: `Add ${params.mealType} for ${new Date(params.date).toLocaleDateString()}`,
            headerBackTitle: "Back",
          }}
        />

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for recipes..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (!text.trim()) handleClearSearch();
              }}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <X size={16} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!searchQuery.trim() || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSearch}
            disabled={!searchQuery.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {["favorites", "search"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
                tab === "search" && searchResults.length === 0 && styles.disabledTab,
              ]}
              onPress={() => {
                if (tab === "search" && searchResults.length === 0) return;
                setActiveTab(tab as "search" | "favorites");
              }}
              disabled={tab === "search" && searchResults.length === 0}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                  tab === "search" && searchResults.length === 0 && styles.disabledTabText,
                ]}
              >
                {tab === "favorites" ? "Favorites" : "Search Results"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List or Empty */}
        {isEmpty ? (
          <EmptyState
            title={activeTab === "favorites" ? "No favorites yet" : "No search results"}
            message={
              activeTab === "favorites"
                ? "Save some recipes to your favorites first."
                : "Try searching for ingredients like 'chicken', 'rice', or 'tomato'."
            }
          />
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item) => item.id}
            renderItem={renderRecipeItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recipeList}
            extraData={selectedRecipe} 
          />
        )}

        {/* Add Button */}
        {selectedRecipe && (
          <View style={styles.floatingButtonContainer}>
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={handleAddMeal}
              activeOpacity={0.8}
            >
              <Text style={styles.floatingButtonText}>
                Add to {params.mealType}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
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
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  disabledTab: {
    opacity: 0.5,
  },
  activeTab: {
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      }
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: "600",
  },
  disabledTabText: {
    opacity: 0.5,
  },
  recipeList: {
    paddingBottom: 80,
    gap: 12,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  floatingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  floatingButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  recipeItemContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  selectedRecipeContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
});