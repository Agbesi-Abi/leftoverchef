import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import RecipeCard from '@/components/RecipeCard';
import EmptyState from '@/components/EmptyState';
import { useRecipe } from '@/contexts/RecipeContext';
import { useStats } from '@/contexts/StatsProvider';
import { Recipe } from '@/types';
import { router } from 'expo-router';
import colors from '@/constant/colors';
import React from 'react';

export default function RecipesScreen() {
  const { recipes, ingredients, loading } = useRecipe();
  const { incrementRecipesViewed } = useStats();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (recipes.length > 0) {
      incrementRecipesViewed(recipes.length);
    }
  }, [recipes, incrementRecipesViewed]);

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: "/(recipe)/[id]",
      params: { id: recipe.id }
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Finding recipes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Suggestions</Text>
        {ingredients.length > 0 && (
          <Text style={styles.subtitle}>
            Based on {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      
      {recipes.length > 0 ? (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard 
              recipe={item} 
              onPress={() => handleRecipePress(item)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <EmptyState
          title="No recipes found"
          message="Try adding different ingredients or check our popular recipes below"
          actionLabel="Go back to ingredients"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
});
