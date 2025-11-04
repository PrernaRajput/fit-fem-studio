'use server';
/**
 * @fileOverview Looks up a food item by its UPC barcode and returns nutritional information.
 *
 * - lookupFoodByBarcode - A function that returns nutritional information for a given UPC.
 * - LookupFoodByBarcodeInput - The input type for the function.
 * - AnalyzeFoodOutput - The return type for the function (reusing AnalyzeFoodOutput).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
    prompt: `You are a nutrition database expert. A user has scanned a barcode. Look up the food item associated with the following UPC/EAN barcode and provide its nutritional information.
    
    Barcode: {{{barcode}}}
    
    1.  Identify the product from the barcode.
    2.  Provide your best estimate for the calories, protein, carbohydrates, and fat for a standard serving size (e.g., 100g or a typical serving).
    3.  Return a list of common 'measurements' for this food. This list MUST include a base unit of "g" or "ml". It should also include a "serving" unit.
        - For each measurement, provide the 'unit' name (e.g., "serving", "g") and its 'quantity' relative to the base unit.
    
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
