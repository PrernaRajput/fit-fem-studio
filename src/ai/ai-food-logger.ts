'use server';
/**
 * @fileOverview Analyzes a food query and returns its nutritional information.
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
    prompt: `You are a nutrition expert. Analyze the user's food query and provide the nutritional information.
    
    Query: {{{query}}}
    
    Provide your best estimate for the calories, protein, carbohydrates, and fat.
    Clean up the food name to be a simple, display-friendly string.`,
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
