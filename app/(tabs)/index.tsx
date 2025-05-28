import { useCallback, useState, useEffect } from 'react';
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout
} from 'react-native-reanimated';
import { Canvas, Circle, vec } from "@shopify/react-native-skia";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import colors from '@/constant/colors';
import IngredientInput from '@/components/IngredientInput';
import IngredientTag from '@/components/IngredientTag';
import PrimaryButton from '@/components/PrimaryButton';
import { useRecipe } from '@/contexts/RecipeContext';
import RecentIngredients from '@/components/RecentIngredients';
import { ChefHat, TrendingUp, Clock, Star } from 'lucide-react-native';
import React from 'react';
import RecipeCard from '@/components/RecipeCard';


const AnimatedView = Animated.createAnimatedComponent(View);

export default function HomeScreen() {
  const [currentIngredient, setCurrentIngredient] = useState('');
  const { ingredients, addIngredient, removeIngredient, clearIngredients, searchRecipes } = useRecipe();
  type Meal = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    [key: string]: any;
  };
  const [exploreRecipes, setExploreRecipes] = useState<Meal[]>([]);

  const handleAddIngredient = useCallback(() => {
    if (currentIngredient.trim()) {
      addIngredient(currentIngredient.trim());
      setCurrentIngredient('');
    }
  }, [currentIngredient, addIngredient]);

  const handleFindRecipes = useCallback(async () => {
    if (ingredients.length > 0) {
      await searchRecipes();
      router.push('/recipes');
    }
  }, [ingredients, searchRecipes]);

  useEffect(() => {
    const fetchRandomRecipes = async () => {
      try {
        // Fetch 3 random recipes
        const recipes = await Promise.all([
          fetch('https://www.themealdb.com/api/json/v1/1/random.php'),
          fetch('https://www.themealdb.com/api/json/v1/1/random.php'),
          fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        ]);
        
        const data = await Promise.all(recipes.map(r => r.json()));
        setExploreRecipes(data.map(d => d.meals[0]));
      } catch (error) {
        console.error('Failed to fetch random recipes:', error);
      }
    };

    fetchRandomRecipes();
  }, []);

  // const renderQuickActions = () => (
  //   <AnimatedView 
  //     entering={FadeInDown.delay(600).duration(1000)}
    
  //   >
 
  //   </AnimatedView>
  // );

  const renderExploreSection = () => (
    <AnimatedView 
      entering={FadeInDown.delay(600).duration(1000)}
      style={styles.exploreContainer}
    >
      <View style={styles.exploreTitleContainer}>
        <Text style={styles.sectionTitle}>Explore Recipes</Text>
        <TouchableOpacity 
          onPress={() => router.push('/all-recipes')}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exploreScroll}
      >
        {exploreRecipes.map((recipe, index) => (
          <Animated.View
            key={recipe.idMeal}
            entering={FadeInDown.delay(index * 200)}
            style={styles.recipeCardContainer}
          >
            <RecipeCard
              recipe={recipe}
              onPress={() => router.push(`/(recipe)/${recipe.idMeal}`)}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </AnimatedView>
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Decoration */}
          <Canvas style={styles.canvas}>
            <Circle
              c={vec(0, 0)}
              r={200}
              color={colors.primaryLight + '10'}
            />
          </Canvas>

          <AnimatedView
            entering={FadeInDown.duration(1000)}
            style={styles.heroCard}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <ChefHat size={36} color="#fff" />
              </View>
              <Text style={styles.heroText}>Hey Chef! 🍳</Text>
              <Text style={styles.subHeroText}>
                Let's turn your ingredients into amazing meals
              </Text>
            </View>
          </AnimatedView>

          {/* Enhanced Input Section */}
          <AnimatedView
            entering={FadeInDown.delay(200).duration(1000)}
          >
            <IngredientInput
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              onSubmit={handleAddIngredient}
            />
          </AnimatedView>

          {/* Animated Ingredients Section */}
          {ingredients.length > 0 ? (
            <AnimatedView
              entering={FadeInDown.delay(400).duration(1000)}
              layout={Layout.springify()}
              style={styles.ingredientsContainer}
            >
              <View style={styles.ingredientsHeader}>
                <Text style={styles.ingredientsTitle}>✨ Your Ingredients</Text>
                <TouchableOpacity
                  onPress={clearIngredients}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tagsContainer}>
                {ingredients.map((ingredient, index) => (
                  <Animated.View
                    key={ingredient}
                    entering={FadeInDown.delay(index * 100)}
                    exiting={FadeOutUp}
                    layout={Layout.springify()}
                  >
                    <IngredientTag
                      label={ingredient}
                      onRemove={() => removeIngredient(ingredient)}
                    />
                  </Animated.View>
                ))}
              </View>

              <PrimaryButton
                title="🍲 Find Recipes"
                onPress={handleFindRecipes}
                style={styles.findButton}
              />
            </AnimatedView>
          ) : (
            <AnimatedView
              entering={FadeInDown.delay(400).duration(1000)}
            >
              <RecentIngredients
                onSelectIngredient={addIngredient}
              />
            </AnimatedView>
          )}

          {ingredients.length === 0 && (
            <>
              {/* {renderQuickActions()} */}
              {renderExploreSection()}
              
              <AnimatedView 
                entering={FadeInDown.delay(800).duration(1000)}
                style={styles.tipsContainer}
              >
                <Text style={styles.sectionTitle}>Pro Tips 💡</Text>
                <View style={styles.tipCard}>
                  <Text style={styles.tipTitle}>Reduce Food Waste</Text>
                  <Text style={styles.tipText}>
                    Check your fridge for ingredients that need to be used soon. 
                    Adding them here will help you find the perfect recipe!
                  </Text>
                </View>
              </AnimatedView>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  canvas: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
  },
  iconContainer: {
    backgroundColor: colors.primary + '40',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    alignItems: 'center',
  },
  heroText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.white,
    marginTop: 8,
  },
  subHeroText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.primaryLight,
    marginTop: 8,
    textAlign: 'center',
  },
  ingredientsContainer: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  clearButton: {
    backgroundColor: colors.error + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.error,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  findButton: {
    marginTop: 8,
  },
  // quickActionsContainer: {
  //   marginTop: 24,
  //   marginBottom: 24,
  // },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 12,
  },
  actionCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textLight,
    lineHeight: 20,
  },
  exploreContainer: {
    marginVertical: 24,
  },
  exploreTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.primaryLight + '20',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
  exploreScroll: {
    paddingRight: 24,
  },
  recipeCardContainer: {
    width: 280,
    marginRight: 16,
  }
});
