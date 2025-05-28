import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';

// This would normally come from storage or an API
const suggestedIngredients = [
  'Chicken', 'Rice', 'Pasta', 'Tomato', 'Onion', 
  'Potato', 'Carrot', 'Broccoli', 'Beef', 'Salmon',
  'Spinach', 'Garlic', 'Lemon', 'Cheese', 'Eggs'
];

interface RecentIngredientsProps {
  onSelectIngredient: (ingredient: string) => void;
}

export default function RecentIngredients({ onSelectIngredient }: RecentIngredientsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={20} color="#757575" />
        <Text style={styles.title}>Suggested Ingredients</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.tagsContainer}>
          {suggestedIngredients.map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              style={styles.tagButton}
              onPress={() => onSelectIngredient(ingredient)}
            >
              <Text style={styles.tagText}>{ingredient}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#212121',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#424242',
  },
});