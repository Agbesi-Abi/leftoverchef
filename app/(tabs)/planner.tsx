import React, { useState, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Platform,
  Alert,
  SafeAreaView
} from "react-native";
import { useRouter } from "expo-router";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Coffee, 
  Utensils, 
  Moon,
  X
} from "lucide-react-native";
import colors from "@/constant/colors";
import { useMealPlanStore } from "@/store/useMealPlanStore";
import { 
  formatShortDate, 
  getWeekDates, 
  getNextWeekStart, 
  getPreviousWeekStart,
  isToday,
  getDayName
} from "@/utils/dateUtils"
import { RecipeSearchResult } from "@/types";
import { LinearGradient } from "expo-linear-gradient";

type MealType = 'breakfast' | 'lunch' | 'dinner';

export default function MealPlanScreen() {
  const router = useRouter();
  const { 
    mealPlan, 
    selectedWeekStart, 
    setSelectedWeekStart,
    removeMeal
  } = useMealPlanStore();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const weekDates = getWeekDates(selectedWeekStart);
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);
  
  const handlePreviousWeek = () => {
    const newStartDate = getPreviousWeekStart(selectedWeekStart);
    setSelectedWeekStart(newStartDate);
  };
  
  const handleNextWeek = () => {
    const newStartDate = getNextWeekStart(selectedWeekStart);
    setSelectedWeekStart(newStartDate);
  };
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };
  
  const handleAddMeal = async (date: string, mealType: MealType) => {
    try {
      setIsLoading(true);
      
      if (!date || !mealType) {
        throw new Error('Missing date or meal type');
      }

      setSelectedDate(date);
      setSelectedMealType(mealType);
      
      router.push({
        pathname: '/meal-plan/select-recipe',
        params: {
          date,
          mealType
        }
      });
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveMeal = (date: string, mealType: MealType) => {
    Alert.alert(
      "Remove Meal",
      "Are you sure you want to remove this meal from your plan?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => removeMeal(date, mealType)
        }
      ]
    );
  };
  
  const renderMealItem = (date: string, mealType: MealType) => {
    const meal = mealPlan[date]?.[mealType];
    
    if (!meal) {
      return (
        <TouchableOpacity 
          style={styles.addMealButton}
          onPress={() => handleAddMeal(date, mealType)}
          activeOpacity={0.7}
        >
          <Plus size={18} color={colors.primary} />
          <Text style={styles.addMealText}>Add {mealType}</Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.mealItem}>
        <TouchableOpacity 
          style={styles.mealContent}
          onPress={() => router.push(`/(recipe)/${meal.id}`)}
          activeOpacity={0.7}
        >
          <Text style={styles.mealTitle} numberOfLines={1}>
            {meal.title || meal.strMeal}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeMealButton}
          onPress={() => handleRemoveMeal(date, mealType)}
          activeOpacity={0.7}
        >
          <X size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderMealTypeIcon = (mealType: MealType) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee size={16} color={colors.primary} />;
      case 'lunch':
        return <Utensils size={16} color={colors.primary} />;
      case 'dinner':
        return <Moon size={16} color={colors.primary} />;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Meal Planner</Text>
        <Text style={styles.subtitle}>
          Plan your meals for the week ahead
        </Text>
      </View>
      
      <View style={styles.weekSelector}>
        <TouchableOpacity 
          style={styles.weekButton}
          onPress={handlePreviousWeek}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.weekInfo}>
          <Calendar size={18} color={colors.primary} style={styles.calendarIcon} />
          <Text style={styles.weekText}>
            {formatShortDate(selectedWeekStart)} - {formatShortDate(weekDates[6])}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.weekButton}
          onPress={handleNextWeek}
        >
          <ChevronRight size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {weekDates.map((date) => (
          <View 
            key={date} 
            style={[
              styles.dayContainer,
              isToday(date) && styles.todayContainer
            ]}
          >
            <View style={styles.dayHeader}>
              <View>
                <Text style={styles.dayName}>{getDayName(date)}</Text>
                <Text style={styles.dayDate}>{formatShortDate(date)}</Text>
              </View>
              {isToday(date) && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Today</Text>
                </View>
              )}
            </View>
            
            <View style={styles.mealsContainer}>
              <View style={styles.mealTypeContainer}>
                <View style={styles.mealTypeHeader}>
                  {renderMealTypeIcon('breakfast')}
                  <Text style={styles.mealTypeText}>Breakfast</Text>
                </View>
                {renderMealItem(date, 'breakfast')}
              </View>
              
              <View style={styles.mealTypeContainer}>
                <View style={styles.mealTypeHeader}>
                  {renderMealTypeIcon('lunch')}
                  <Text style={styles.mealTypeText}>Lunch</Text>
                </View>
                {renderMealItem(date, 'lunch')}
              </View>
              
              <View style={styles.mealTypeContainer}>
                <View style={styles.mealTypeHeader}>
                  {renderMealTypeIcon('dinner')}
                  <Text style={styles.mealTypeText}>Dinner</Text>
                </View>
                {renderMealItem(date, 'dinner')}
              </View>
            </View>
          </View>
        ))}
        
        <View style={styles.weekSummary}>
          <LinearGradient
            colors={[colors.primaryLight, colors.secondaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Weekly Summary</Text>
              <Text style={styles.summaryText}>
                You have planned {countMealsInWeek(mealPlan, weekDates)} meals this week.
              </Text>
              <TouchableOpacity 
                style={styles.summaryButton}
                onPress={() => router.push('/meal-plan/shopping-list')}
              >
                <Text style={styles.summaryButtonText}>Generate Shopping List</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </Animated.View>
    </SafeAreaView>
  );
}

// Helper function to count meals in a week
function countMealsInWeek(mealPlan: any, weekDates: string[]): number {
  let count = 0;
  
  weekDates.forEach(date => {
    if (mealPlan[date]) {
      if (mealPlan[date].breakfast) count++;
      if (mealPlan[date].lunch) count++;
      if (mealPlan[date].dinner) count++;
    }
  });
  
  return count;
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
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
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
  weekButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  weekInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  dayContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
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
  todayContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(76, 175, 80, 0.2)',
      }
    }),
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  dayDate: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  todayBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  mealsContainer: {
    padding: 16,
  },
  mealTypeContainer: {
    marginBottom: 16,
  },
  mealTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
  },
  addMealButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderStyle: "dashed",
  },
  addMealText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
  },
  mealContent: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  removeMealButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  weekSummary: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  summaryGradient: {
    borderRadius: 16,
  },
  summaryContent: {
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  summaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});