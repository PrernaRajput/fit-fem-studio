'use server';
/**
 * @fileOverview Looks up a food item by its UPC barcode and returns nutritional information.
 *
 * - lookupFoodByBarcode - A function that returns nutritional information for a given UPC.
 * - LookupFoodByBarcodeInput - The input type for the function.
 * - AnalyzeFoodOutput - The return type for the function (reusing AnalyzeFoodOutput).
 */

import {ai} from '@/ai/genkit';
import {
  AnalyzeFoodOutputSchema,
  type AnalyzeFoodOutput,
  LookupFoodByBarcodeInputSchema,
  type LookupFoodByBarcodeInput,
} from '@/lib/types';

const lookupFoodPrompt = ai.definePrompt({
    name: 'lookupFoodPrompt',
    input: { schema: LookupFoodByBarcodeInputSchema },
    output: { schema: AnalyzeFoodOutputSchema },
    prompt: `You are an expert nutrition database API. Your task is to use a global UPC/EAN barcode database (like Open Food Facts or a similar comprehensive source) to find the exact product and its nutritional information.

    Barcode: {{{barcode}}}
    
    1.  **Query Database**: Look up the food item associated with the provided barcode.
    2.  **Identify Product**: Return the precise product name as listed in the database.
    3.  **Provide Nutrition**: Extract the nutritional information for a standard serving size (as defined on the product's label, or 100g if not available). This includes calories, protein, carbohydrates, and fat.
    4.  **List Measurements**: Return a list of common 'measurements'. This MUST include a base unit of "g" or "ml" with quantity 1. It must also include a "serving" unit that corresponds to the nutritional data provided.
    
    Example for barcode '016000275287' (Cheerios):
    - foodName: "Cheerios Cereal"
    - calories: 140 (for a 39g serving)
    - protein: 5
    - carbohydrates: 29
    - fat: 2.5
    - measurements:
        - { unit: "g", quantity: 1 }
        - { unit: "serving", quantity: 39 }
        - { unit: "cup", quantity: 39 }`,
});

const lookupFoodByBarcodeFlow = ai.defineFlow(
  {
    name: 'lookupFoodByBarcodeFlow',
    inputSchema: LookupFoodByBarcodeInputSchema,
    outputSchema: AnalyzeFoodOutputSchema,
  },
  async (input) => {
    const { output } = await lookupFoodPrompt(input);
    return output!;
  }
);

export async function lookupFoodByBarcode(
  input: LookupFoodByBarcodeInput
): Promise<AnalyzeFoodOutput> {
  return lookupFoodByBarcodeFlow(input);
}
