import { z } from 'zod';

export const AnalyzeFoodInputSchema = z.object({
  query: z.string().describe('A natural language query about a food item, e.g., "one large banana" or "2 slices of whole wheat toast with butter".'),
});
export type AnalyzeFoodInput = z.infer<typeof AnalyzeFoodInputSchema>;

export const AnalyzeFoodOutputSchema = z.object({
  foodName: z.string().describe('The identified name of the food item, formatted for display (e.g., "Large Banana").'),
  calories: z.number().describe('The estimated number of calories in the food item.'),
  protein: z.number().describe('The estimated grams of protein.'),
  carbohydrates: z.number().describe('The estimated grams of carbohydrates.'),
  fat: z.number().describe('The estimated grams of fat.'),
});
export type AnalyzeFoodOutput = z.infer<typeof AnalyzeFoodOutputSchema>;
