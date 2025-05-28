import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Alert } from 'react-native';
import { useFavorites } from '@/contexts/FavoritesProvider';
import RecipeCard from '@/components/RecipeCard';
import EmptyState from '@/components/EmptyState';
import { Recipe } from '@/types';
import { router } from 'expo-router';
import colors from '@/constant/colors';
import React from 'react';

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: "/(recipe)/[id]",
      params: { id: recipe.id }
    });
  };

  const handleDelete = (recipeId: string) => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this recipe from your favorites?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: () => removeFavorite(recipeId),
          style: "destructive"
        }
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate fetch delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard 
              recipe={item} 
              onPress={() => handleRecipePress(item)}
              showDeleteButton
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <EmptyState
          title="No favorites yet"
          message="Save recipes that you love and they will appear here"
          actionLabel="Find recipes"
          onAction={() => router.push('/')}
        />
      )}
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
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
});