import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, Share, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getMealById } from '@/services/api';
import { useFavorites } from '@/contexts/FavoritesProvider';
import { useStats } from '@/contexts/StatsProvider';
import { Recipe } from '@/types';
import { Heart, ChevronLeft, Clock, Users, Check, Award, Share2, Globe, Youtube } from 'lucide-react-native';
import * as React from 'react';
import colors from '@/constant/colors';
import * as Haptics from 'expo-haptics';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canMarkAsMade, setCanMarkAsMade] = useState(false);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { incrementRecipesSaved, incrementMealsMade } = useStats();
  const scrollViewRef = useRef(null);
  
  const isFavorite = favorites.some(fav => fav.id === id);

  useEffect(() => {
    async function loadRecipe() {
      try {
        if (id) {
          const data = await getMealById(id);
          setRecipe(data);
        }
      } catch (error) {
        console.error('Error loading recipe:', error);
        Alert.alert('Error', 'Failed to load recipe details');
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  const toggleFavorite = () => {
    if (recipe) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isFavorite) {
        removeFavorite(recipe.id);
      } else {
        addFavorite(recipe);
        incrementRecipesSaved();
      }
    }
  };

  const markAsMade = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    incrementMealsMade();
    Alert.alert(
      'Great job!', 
      'You\'ve earned points for making this recipe.',
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back to recipes screen
            router.replace('/(tabs)/recipes');
          } 
        }
      ]
    );
  };

  const shareRecipe = async () => {
    try {
      await Share.share({
        message: `Check out this delicious recipe: ${recipe?.strMeal}\n\n${recipe?.strSource || 'No URL available'}`,
        title: recipe?.strMeal
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share recipe');
    }
  };

  const openYoutube = () => {
    if (recipe?.strYoutube) {
      Linking.openURL(recipe.strYoutube);
    } else {
      Alert.alert('Error', 'No video available for this recipe');
    }
  };

  const openSource = () => {
    if (recipe?.strSource) {
      Linking.openURL(recipe.strSource);
    } else {
      Alert.alert('Error', 'No source available for this recipe');
    }
  };

  const handleScroll = (event: import('react-native').NativeSyntheticEvent<import('react-native').NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    // Enable button when user has scrolled to the bottom (with a 50px threshold)
    const isAtBottom = contentHeight - offsetY - scrollViewHeight < 50;
    setCanMarkAsMade(isAtBottom);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Extract ingredients and measurements from recipe
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}` as keyof Recipe] as string;
    const measure = recipe[`strMeasure${i}` as keyof Recipe] as string;
    
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push({
        name: ingredient,
        measure: measure || ''
      });
    }
  }

  // Format instructions with proper line breaks
  const formattedInstructions = recipe.strInstructions
    .split('\r\n')
    .filter(step => step.trim() !== '');

  return (
    
      <><ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.strMealThumb }}
          style={styles.image}
          resizeMode="cover" />
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareRecipe}
          >
            <Share2 color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive
          ]}
          onPress={toggleFavorite}
        >
          <Heart
            color={isFavorite ? "#FFFFFF" : colors.favorite}
            fill={isFavorite ? "#FFFFFF" : "none"}
            size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{recipe.strMeal}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={18} color={colors.textLight} />
            <Text style={styles.metaText}>30 min</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={18} color={colors.textLight} />
            <Text style={styles.metaText}>4 servings</Text>
          </View>
          <View style={styles.metaItem}>
            <Award size={18} color={colors.textLight} />
            <Text style={styles.metaText}>{recipe.strArea}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {recipe.strYoutube && (
            <TouchableOpacity
              style={[styles.actionButton, styles.youtubeButton]}
              onPress={openYoutube}
            >
              <Youtube size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Watch Video</Text>
            </TouchableOpacity>
          )}
          {recipe.strSource && (
            <TouchableOpacity
              style={[styles.actionButton, styles.sourceButton]}
              onPress={openSource}
            >
              <Globe size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>View Source</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            {ingredients.map((item, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientMeasure}>{item.measure}</Text> {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsContainer}>
            {formattedInstructions
              .slice(0, isExpanded ? formattedInstructions.length : 3)
              .map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  {/* <Text style={styles.stepNumber}>{index + 1}.</Text> */}
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))}

            {formattedInstructions.length > 3 && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                <Text style={styles.toggleText}>
                  {isExpanded ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ScrollView><View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[
            styles.madeButton,
            !canMarkAsMade && styles.madeButtonDisabled
          ]}
          onPress={markAsMade}
          activeOpacity={0.8}
          disabled={!canMarkAsMade}
        >
          {/* <Check size={20} color="#FFFFFF" /> */}
          <Text style={[
            styles.madeButtonText,
            !canMarkAsMade && styles.madeButtonTextDisabled
          ]}>
            {canMarkAsMade ? "I Made This! ✅" : "Scroll to read full recipe"}
          </Text>
        </TouchableOpacity>
      </View></>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: -20,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteButtonActive: {
    backgroundColor: colors.favorite,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  youtubeButton: {
    backgroundColor: '#FF0000',
  },
  sourceButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  toggleButton: {
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
  ingredientsList: {
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    lineHeight: 24,
  },
  ingredientMeasure: {
    fontFamily: 'Inter-Medium',
    color: colors.primary,
  },
  instructionsContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    fontFamily: 'Inter-Bold',
    color: colors.primary,
    marginRight: 8,
    fontSize: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    lineHeight: 24,
  },
  madeButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  madeButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0.1,
  },
  madeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  madeButtonTextDisabled: {
    color: colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.primary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: colors.error,
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  floatingButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
});