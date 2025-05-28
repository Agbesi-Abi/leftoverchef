import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { Recipe } from '@/types';
import { Image } from 'expo-image';
import { Trash2, Check, Heart } from 'lucide-react-native';
import colors from '@/constant/colors';
import { useFavorites } from '@/contexts/FavoritesProvider';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  index?: number;
  isSelected?: boolean;
  compact?: boolean;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function RecipeCard({
  recipe,
  onPress,
  isSelected,
  showDeleteButton,
  onDelete,
  compact,
  index = 0,
}: RecipeCardProps) {
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  // Ensure accurate favorite comparison
  const recipeId = recipe.idMeal || recipe.id;
  const isFavorite = favorites.some(fav =>
    fav.idMeal === recipeId || fav.id === recipeId
  );

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavorite(recipeId);
    } else {
      const normalizedRecipe = {
        ...recipe,
        id: recipeId,
        strMeal: recipe.strMeal || recipe.title,
        strMealThumb: recipe.strMealThumb || recipe.thumbnail,
        strCategory: recipe.strCategory || recipe.category,
      };
      addFavorite(normalizedRecipe);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100)}
      exiting={FadeOut}
      layout={Layout.springify()}
    >
      <AnimatedTouchable
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
          compact && styles.compactContainer,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: recipe.strMealThumb || recipe.thumbnail }}
          placeholder={blurhash}
          contentFit="cover"
          transition={1000}
          style={[
            styles.image,
            compact && styles.compactImage,
            isSelected && styles.selectedImage,
          ]}
          resizeMode="cover"
        />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          <Heart
            size={24}
            color={isFavorite ? colors.favorite : colors.primary}
            fill={isFavorite ? colors.favorite : 'none'}
          />
        </TouchableOpacity>

        {isSelected && (
          <Animated.View
            style={styles.selectedBadge}
            entering={FadeInUp.duration(200)}
          >
            <Check size={16} color={colors.white} />
          </Animated.View>
        )}

        {showDeleteButton && onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={colors.white} />
          </TouchableOpacity>
        )}

        <Animated.View
          style={[
            styles.content,
            compact && styles.compactContent,
          ]}
          entering={FadeInUp.delay(200)}
        >
          <Text
            style={[
              styles.title,
              compact && styles.compactTitle,
              isSelected && styles.selectedTitle,
            ]}
            numberOfLines={compact ? 1 : 2}
          >
            {recipe.strMeal || recipe.title}
          </Text>

          <View style={styles.meta}>
            {recipe.strCategory && (
              <View style={[
                styles.categoryBadge,
                isSelected && styles.selectedCategoryBadge,
              ]}>
                <Text style={styles.categoryText}>
                  {recipe.strCategory}
                </Text>
              </View>
            )}
            {recipe.strArea && (
              <Text style={[
                styles.areaText,
                isSelected && styles.selectedAreaText,
              ]}>
                {recipe.strArea}
              </Text>
            )}
          </View>
        </Animated.View>
      </AnimatedTouchable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transform: [{ scale: 0.98 }],
  },
  compactContainer: {
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
  },
  compactImage: {
    height: 150,
  },
  selectedImage: {
    opacity: 0.9,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  content: {
    padding: 12,
    backgroundColor: colors.white,
  },
  compactContent: {
    padding: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  selectedTitle: {
    color: colors.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectedCategoryBadge: {
    backgroundColor: colors.primaryLight,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.white,
  },
  areaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  selectedAreaText: {
    color: colors.primary,
  },
});
