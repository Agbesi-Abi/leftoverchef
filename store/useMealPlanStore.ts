import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recipe, MealType } from "@/types";

interface MealPlanStore {
  version: number;
  mealPlan: {
    [date: string]: {
      [key in MealType]?: Recipe;
    };
  };
  selectedWeekStart: string;
  setSelectedWeekStart: (date: string) => void;
  addMeal: (date: string, mealType: MealType, recipe: Recipe) => void;
  removeMeal: (date: string, mealType: MealType) => void;
}

export const useMealPlanStore = create<MealPlanStore>()(
  persist(
    (set) => ({
      version: 1, // Add version number
      mealPlan: {},
      selectedWeekStart: new Date().toISOString().split("T")[0],
      setSelectedWeekStart: (date) => set({ selectedWeekStart: date }),
      addMeal: (date, mealType, recipe) =>
        set((state) => ({
          mealPlan: {
            ...state.mealPlan,
            [date]: {
              ...state.mealPlan[date],
              [mealType]: recipe,
            },
          },
        })),
      removeMeal: (date, mealType) =>
        set((state) => {
          const updatedDate = { ...state.mealPlan[date] };
          delete updatedDate[mealType];
          const newMealPlan = { ...state.mealPlan };
          if (Object.keys(updatedDate).length) {
            newMealPlan[date] = updatedDate;
          } else {
            delete newMealPlan[date];
          }
          return {
            mealPlan: newMealPlan,
          };
        }),
    }),
    {
      name: "leftoverchef-meal-plan",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 to 1
          return {
            ...persistedState,
            version: 1,
          };
        }
        return persistedState;
      },
    }
  )
);