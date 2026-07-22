// lib/foodDatabase.ts
// Curated common foods with macros per 100g, for manual search when a photo
// misses an ingredient or a meal isn't photographed at all.
export interface FoodDatabaseEntry {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export const FOOD_DATABASE: FoodDatabaseEntry[] = [
  { name: "Chicken breast, grilled", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: "Chicken thigh, grilled", caloriesPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11 },
  { name: "Ground beef, 85% lean", caloriesPer100g: 215, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 12 },
  { name: "Salmon, cooked", caloriesPer100g: 206, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 13 },
  { name: "Shrimp, cooked", caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3 },
  { name: "Egg, whole", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: "Tofu, firm", caloriesPer100g: 144, proteinPer100g: 15.5, carbsPer100g: 2.8, fatPer100g: 8.7 },
  { name: "Greek yogurt, plain", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "Cottage cheese", caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3 },
  { name: "White rice, cooked", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: "Brown rice, cooked", caloriesPer100g: 123, proteinPer100g: 2.6, carbsPer100g: 26, fatPer100g: 1 },
  { name: "Quinoa, cooked", caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9 },
  { name: "Pasta, cooked", caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1 },
  { name: "Oats, dry", caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7 },
  { name: "Bread, whole wheat", caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: "Potato, baked", caloriesPer100g: 93, proteinPer100g: 2.5, carbsPer100g: 21, fatPer100g: 0.1 },
  { name: "Sweet potato, baked", caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 21, fatPer100g: 0.2 },
  { name: "Avocado", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },
  { name: "Broccoli, steamed", caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7.2, fatPer100g: 0.4 },
  { name: "Spinach, raw", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: "Mixed salad greens", caloriesPer100g: 17, proteinPer100g: 1.4, carbsPer100g: 3, fatPer100g: 0.2 },
  { name: "Carrot, raw", caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2 },
  { name: "Tomato, raw", caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { name: "Cucumber, raw", caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
  { name: "Bell pepper, raw", caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3 },
  { name: "Banana", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { name: "Apple", caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
  { name: "Blueberries", caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3 },
  { name: "Strawberries", caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3 },
  { name: "Orange", caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1 },
  { name: "Almonds", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: "Peanut butter", caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { name: "Olive oil", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: "Butter", caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81 },
  { name: "Cheddar cheese", caloriesPer100g: 402, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33 },
  { name: "Mozzarella cheese", caloriesPer100g: 280, proteinPer100g: 28, carbsPer100g: 3.1, fatPer100g: 17 },
  { name: "Milk, whole", caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3 },
  { name: "Black beans, cooked", caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5 },
  { name: "Chickpeas, cooked", caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27, fatPer100g: 2.6 },
  { name: "Lentils, cooked", caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4 },
  { name: "Hummus", caloriesPer100g: 166, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 9.6 },
  { name: "Pizza, cheese slice", caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10 },
  { name: "French fries", caloriesPer100g: 312, proteinPer100g: 3.4, carbsPer100g: 41, fatPer100g: 15 },
  { name: "Dark chocolate", caloriesPer100g: 546, proteinPer100g: 4.9, carbsPer100g: 61, fatPer100g: 31 },
  { name: "Granola", caloriesPer100g: 471, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 20 },
];
