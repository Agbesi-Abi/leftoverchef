import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

interface IngredientInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export default function IngredientInput({ 
  value, 
  onChangeText,
  onSubmit
}: IngredientInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Add an ingredient (e.g., chicken, onion)"
        placeholderTextColor="#9E9E9E"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        blurOnSubmit={false}
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={onSubmit}
        disabled={!value.trim()}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#212121',
  },
  addButton: {
    width: 56,
    height: 56,
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});