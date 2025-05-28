import React, { useCallback, useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  Animated,
  SafeAreaView,
  Share
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Check, ShoppingBag, Share2, Download, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constant/colors";
import { useMealPlanStore } from "@/store/useMealPlanStore";
import { getWeekDates } from "@/utils/dateUtils";
import { getMealById } from "@/services/api";
import { Recipe } from "@/types";
import EmptyState from "@/components/EmptyState";
import { LinearGradient } from 'expo-linear-gradient';

interface ShoppingItem {
  id: string;
  name: string;
  measure: string;
  checked: boolean;
  category: string;
}

interface ShoppingListByCategory {
  [category: string]: ShoppingItem[];
}

export default function ShoppingListScreen() {
  const router = useRouter();
  const { mealPlan, selectedWeekStart } = useMealPlanStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<ShoppingListByCategory>({});
  const [totalItems, setTotalItems] = useState(0);
  const [checkedItems, setCheckedItems] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  const weekDates = getWeekDates(selectedWeekStart);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    generateShoppingList();
    // Initialize all categories as expanded
    const initialExpandedState = Object.keys(shoppingList).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedCategories(initialExpandedState);
  }, []);

  useEffect(() => {
    // Animate progress bar when checked items change
    Animated.timing(progressAnim, {
      toValue: checkedItems / totalItems,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [checkedItems, totalItems]);

  const extractIngredientsFromRecipe = (recipe: Recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredientKey = `strIngredient${i}` as keyof typeof recipe;
      const measureKey = `strMeasure${i}` as keyof typeof recipe;
      
      const ingredientName = recipe[ingredientKey];
      const measure = recipe[measureKey];
      
      if (ingredientName && ingredientName.trim()) {
        ingredients.push({
          name: ingredientName.trim(),
          measure: measure?.trim() || ''
        });
      }
    }
    return ingredients;
  };
  
  const generateShoppingList = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const recipeIds = weekDates.reduce<string[]>((acc, date) => {
        const dayMeals = mealPlan[date];
        if (dayMeals) {
          if (dayMeals.breakfast) acc.push(dayMeals.breakfast.id);
          if (dayMeals.lunch) acc.push(dayMeals.lunch.id);
          if (dayMeals.dinner) acc.push(dayMeals.dinner.id);
        }
        return acc;
      }, []);

      const uniqueRecipeIds = [...new Set(recipeIds)];
      
      if (uniqueRecipeIds.length === 0) {
        setShoppingList({});
        setTotalItems(0);
        return;
      }

      const recipes = await Promise.all(
        uniqueRecipeIds.map(id => getMealById(id))
      );

      const ingredientsByCategory: ShoppingListByCategory = {};
      let itemCount = 0;

      recipes.forEach(recipe => {
        if (!recipe) return;
        
        const category = recipe.strCategory || "Other";
        const ingredients = extractIngredientsFromRecipe(recipe);
        
        ingredients.forEach(ingredient => {
          if (!ingredientsByCategory[category]) {
            ingredientsByCategory[category] = [];
          }

          const existingItem = ingredientsByCategory[category].find(
            item => item.name.toLowerCase() === ingredient.name.toLowerCase()
          );

          if (!existingItem) {
            ingredientsByCategory[category].push({
              id: `${category}-${ingredient.name}-${Math.random().toString(36).substr(2, 9)}`,
              name: ingredient.name,
              measure: ingredient.measure,
              checked: false,
              category
            });
            itemCount++;
          }
        });
      });

      setShoppingList(ingredientsByCategory);
      setTotalItems(itemCount);
      setCheckedItems(0);
      
      // Initialize expanded state for new categories
      const newExpandedState = Object.keys(ingredientsByCategory).reduce((acc, category) => {
        acc[category] = expandedCategories[category] !== undefined ? expandedCategories[category] : true;
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedCategories(newExpandedState);
    } catch (error) {
      console.error("Error generating shopping list:", error);
      Alert.alert("Error", "Failed to generate shopping list. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [weekDates, mealPlan, expandedCategories]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    generateShoppingList();
  }, [generateShoppingList]);

  const toggleItemChecked = (category: string, index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    
    setShoppingList(prevList => {
      const updatedList = { ...prevList };
      const item = updatedList[category][index];
      item.checked = !item.checked;
      
      setCheckedItems(prev => item.checked ? prev + 1 : prev - 1);
      return updatedList;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const shareShoppingList = async () => {
    try {
      if (Platform.OS !== "web") {
        Haptics.selectionAsync();
      }
      
      let listText = "📋 Shopping List for the Week\n\n";
      
      Object.entries(shoppingList).forEach(([category, items]) => {
        listText += `🛒 ${category}:\n`;
        
        items.forEach(item => {
          const checkmark = item.checked ? "✓" : "◻";
          listText += `${checkmark} ${item.name}${item.measure ? ` (${item.measure})` : ''}\n`;
        });
        
        listText += "\n";
      });
      
      listText += `\nProgress: ${checkedItems}/${totalItems} items (${Math.round((checkedItems / totalItems) * 100)}%)`;
      
      if (Platform.OS === "web") {
        navigator.clipboard.writeText(listText);
        Alert.alert("Copied to clipboard", "Your shopping list has been copied to clipboard.");
      } else {
        await Share.share({
          message: listText,
          title: "My Shopping List"
        });
      }
    } catch (error) {
      console.error("Error sharing shopping list:", error);
      Alert.alert("Error", "Failed to share shopping list. Please try again.");
    }
  };

  const clearCheckedItems = () => {
    Alert.alert(
      "Clear Checked Items",
      "Are you sure you want to remove all checked items from your list?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          onPress: () => {
            setShoppingList(prev => {
              const updatedList = { ...prev };
              Object.keys(updatedList).forEach(category => {
                updatedList[category] = updatedList[category].filter(item => !item.checked);
              });
              return updatedList;
            });
            setCheckedItems(0);
          }
        }
      ]
    );
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating shopping list...</Text>
      </View>
    );
  }
  
  const hasItems = Object.keys(shoppingList).length > 0;
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: "Shopping List",
            headerRight: () => hasItems && (
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={clearCheckedItems}
                  disabled={checkedItems === 0}
                >
                  <Text style={[styles.headerButtonText, checkedItems === 0 && styles.disabledButton]}>
                    Clear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={shareShoppingList}
                >
                  <Share2 size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )
          }} 
        />

        {hasItems ? (
          <>
            <LinearGradient
              colors={[colors.primaryLight, colors.secondaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Shopping Progress</Text>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { width: progressWidth }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {checkedItems} of {totalItems} items collected
                </Text>
              </View>
            </LinearGradient>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            >
              {Object.entries(shoppingList).map(([category, items]) => (
                <View key={category} style={styles.categoryContainer}>
                  <TouchableOpacity 
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {items.filter(item => !item.checked).length}/{items.length}
                      </Text>
                    </View>
                    <ChevronRight 
                      size={20} 
                      color={colors.textLight} 
                      style={[
                        styles.chevron,
                        expandedCategories[category] && styles.chevronRotated
                      ]} 
                    />
                  </TouchableOpacity>
                  
                  {expandedCategories[category] && items.map((item) => (
                    <TouchableOpacity 
                      key={item.id}
                      style={[
                        styles.itemContainer,
                        item.checked && styles.itemChecked
                      ]}
                      onPress={() => toggleItemChecked(category, items.indexOf(item))}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        item.checked && styles.checkboxChecked
                      ]}>
                        {item.checked && <Check size={14} color={colors.white} />}
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={[
                          styles.itemName,
                          item.checked && styles.itemTextChecked
                        ]}>
                          {item.name}
                        </Text>
                        {item.measure && (
                          <Text style={styles.itemMeasure}>{item.measure}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <EmptyState
            icon={<ShoppingBag size={64} color={colors.primary} />}
            title="No items in shopping list"
            message="Add meals to your meal plan to generate a shopping list."
            action={
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push("/meal-plan")}
              >
                <Text style={styles.emptyStateButtonText}>Go to Meal Plan</Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1,
  },
  progressContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.text,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: "right",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  chevron: {
    marginLeft: "auto",
    transform: [{ rotate: "0deg" }],
  },
  chevronRotated: {
    transform: [{ rotate: "90deg" }],
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  itemChecked: {
    opacity: 0.6,
    backgroundColor: colors.light,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 2,
  },
  itemTextChecked: {
    textDecorationLine: "line-through",
    color: colors.textLight,
  },
  itemMeasure: {
    fontSize: 13,
    color: colors.textLight,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
    marginRight: 8,
    alignItems: "center",
  },
  headerButton: {
    padding: 6,
  },
  headerButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyStateButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
});
