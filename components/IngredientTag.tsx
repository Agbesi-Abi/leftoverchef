import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { X } from 'lucide-react-native';

interface IngredientTagProps {
  label: string;
  onRemove: () => void;
}

export default function IngredientTag({ label, onRemove }: IngredientTagProps) {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
    >
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={onRemove}
        activeOpacity={0.8}
      >
        <X size={16} color="#757575" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#2E7D32',
    marginRight: 6,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});