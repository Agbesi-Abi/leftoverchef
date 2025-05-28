interface ImpactMetrics {
  co2Saved: number;
  waterSaved: number;
  wasteSaved: number;
}

export const calculateEnvironmentalImpact = (
  mealsMade: number,
  ingredientsSaved: number
): ImpactMetrics => {
  // Average metrics per meal (based on EPA and FAO data)
  const CO2_PER_MEAL = 2.5; // kg of CO2 equivalent
  const WATER_PER_MEAL = 1500; // liters of water
  const WASTE_PER_MEAL = 0.5; // kg of food waste

  return {
    co2Saved: mealsMade * CO2_PER_MEAL,
    waterSaved: mealsMade * WATER_PER_MEAL,
    wasteSaved: ingredientsSaved * WASTE_PER_MEAL
  };
};