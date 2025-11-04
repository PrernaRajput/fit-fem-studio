'use server';
/**
 * @fileOverview Analyzes an image of a food item and returns its nutritional information.
 *
 * - analyzeFoodImage - A function that returns nutritional information for a food image.
 * - AnalyzeFoodImageInput - The input type for the function.
 * - AnalyzeFoodOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  AnalyzeFoodOutputSchema,
  type AnalyzeFoodOutput,
  AnalyzeFoodImageInputSchema,
  type AnalyzeFoodImageInput,
} from '@/lib/types';


const analyzeFoodImagePrompt = ai.definePrompt({
    name: 'analyzeFoodImagePrompt',
    input: { schema: AnalyzeFoodImageInputSchema },
    output: { schema: AnalyzeFoodOutputSchema },
    prompt: `You are a nutrition expert. Analyze the food item in the provided image and provide its nutritional information.
    
    Image: {{media url=photoDataUri}}
    
    1.  **Identify the Food**: Identify the primary food item in the image. Be as specific as possible (e.g., "Fried Egg" instead of "Egg").
    2.  **Estimate Portion Size**: Based on the image, estimate a reasonable portion size. This is your reference for the nutritional data.
    3.  **Provide Nutrition**: Provide your best estimate for the calories, protein, carbohydrates, and fat for the estimated portion size.
    4.  **List Measurements**: Return a list of common 'measurements' for this food. This list MUST include a base unit of "g" or "ml".
        - For each measurement, provide the 'unit' name (e.g., "slice", "cup", "large") and its 'quantity' relative to the base unit.
        - For the base unit itself (e.g., "g"), the quantity should be 1.
    
    Example for an image of a single medium apple:
    - foodName: "Apple"
    - calories: 95
    - protein: 0.5
    - carbohydrates: 25
    - fat: 0.3
    - measurements:
        - { unit: "g", quantity: 1 }
        - { unit: "medium", quantity: 182 }
        - { unit: "slice", quantity: 15 }
        - { unit: "cup, sliced", quantity: 125 }`,
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: AnalyzeFoodOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeFoodImagePrompt(input);
    return output!;
  }
);

export async function analyzeFoodImage(
  input: AnalyzeFoodImageInput
): Promise<AnalyzeFoodOutput> {
  return analyzeFoodImageFlow(input);
}
