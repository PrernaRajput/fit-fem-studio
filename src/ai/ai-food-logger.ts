'use server';
/**
 * @fileOverview Analyzes a food query and returns its nutritional information, including various measurement options.
 *
 * - analyzeFood - A function that returns the nutritional information for a given food query.
 * - AnalyzeFoodInput - The input type for the analyzeFood function.
 * - AnalyzeFoodOutput - The return type for the analyzeFood function.
 */

import {ai} from '@/ai/genkit';
import {
  AnalyzeFoodInputSchema,
  AnalyzeFoodOutputSchema,
  type AnalyzeFoodInput,
  type AnalyzeFoodOutput,
} from '@/lib/types';

const analyzeFoodPrompt = ai.definePrompt({
    name: 'analyzeFoodPrompt',
    input: { schema: AnalyzeFoodInputSchema },
    output: { schema: AnalyzeFoodOutputSchema },
    prompt: `You are a nutrition expert. Analyze the user's food query and provide the nutritional information for the specified amount.
    
    Query: {{{query}}}
    
    1.  Clean up the food name to be a simple, display-friendly string (e.g., "Boiled Egg").
    2.  Provide your best estimate for the calories, protein, carbohydrates, and fat for the exact query.
    3.  Return a list of common 'measurements' for this food. This list MUST include a base unit of "g" or "ml".
        - For each measurement, provide the 'unit' name (e.g., "slice", "cup", "medium", "g") and its 'quantity' relative to the base unit (e.g., if the base unit is 'g' and a 'medium apple' is 182g, the quantity for the "medium" unit is 182).
        - For the base unit itself (e.g., "g"), the quantity should be 1.
    
    Example for "1 medium apple":
    - foodName: "Apple"
    - calories: 95 (for one medium apple)
    - (protein, carbs, fat for one medium apple)
    - measurements:
        - { unit: "g", quantity: 1 }
        - { unit: "medium", quantity: 182 }
        - { unit: "slice", quantity: 15 }
        - { unit: "cup, sliced", quantity: 125 }

    Example for "1 cup of rice":
    - foodName: "Rice"
    - calories: 205 (for 1 cup)
    - (protein, carbs, fat for 1 cup)
    - measurements:
        - { unit: "g", quantity: 1 }
        - { unit: "cup", quantity: 158 }
        - { unit: "bowl", quantity: 250 }`,
});

const analyzeFoodFlow = ai.defineFlow(
  {
    name: 'analyzeFoodFlow',
    inputSchema: AnalyzeFoodInputSchema,
    outputSchema: AnalyzeFoodOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeFoodPrompt(input);
    return output!;
  }
);

export async function analyzeFood(
  input: AnalyzeFoodInput
): Promise<AnalyzeFoodOutput> {
  return analyzeFoodFlow(input);
}
