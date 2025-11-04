import { z } from 'zod';

export const AnalyzeFoodInputSchema = z.object({
  query: z.string().describe('A natural language query about a food item, e.g., "one large banana" or "2 slices of whole wheat toast with butter".'),
});
export type AnalyzeFoodInput = z.infer<typeof AnalyzeFoodInputSchema>;

export const MeasurementSchema = z.object({
  unit: z.string().describe('The unit of measurement (e.g., "g", "ml", "slice", "cup").'),
  quantity: z.number().describe('The value of this unit in terms of the base unit (e.g., if base is "g", a "cup" might have a quantity of 150).'),
});
export type Measurement = z.infer<typeof MeasurementSchema>;


export const AnalyzeFoodOutputSchema = z.object({
  foodName: z.string().describe('The identified name of the food item, formatted for display (e.g., "Large Banana").'),
  calories: z.number().describe('The estimated number of calories for the user\'s original query.'),
  protein: z.number().describe('The estimated grams of protein for the user\'s original query.'),
  carbohydrates: z.number().describe('The estimated grams of carbohydrates for the user\'s original query.'),
  fat: z.number().describe('The estimated grams of fat for the user\'s original query.'),
  measurements: z.array(MeasurementSchema).describe('A list of common measurements for this food item, including a base unit like "g" or "ml".'),
});
export type AnalyzeFoodOutput = z.infer<typeof AnalyzeFoodOutputSchema>;

export const LookupFoodByBarcodeInputSchema = z.object({
  barcode: z.string().describe('The UPC or EAN barcode of the food product.'),
});
export type LookupFoodByBarcodeInput = z.infer<typeof LookupFoodByBarcodeInputSchema>;
