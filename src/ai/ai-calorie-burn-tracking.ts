'use server';

/**
 * @fileOverview This file defines a Genkit flow for calculating calorie burn per exercise and total calories burned per day.
 *
 * - calculateCalorieBurn - A function that calculates calorie burn based on MET, weight, time, and optional weight input.
 * - CalculateCalorieBurnInput - The input type for the calculateCalorieBurn function.
 * - CalculateCalorieBurnOutput - The return type for the calculateCalorieBurn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateCalorieBurnInputSchema = z.object({
  met: z.number().describe('Metabolic equivalent of task (MET) value for the exercise.'),
  weightKg: z.number().describe('User weight in kilograms.'),
  durationMinutes: z.number().describe('Duration of the exercise in minutes.'),
  additionalWeightKg: z
    .number()
    .optional()
    .describe('Additional weight used during the exercise in kilograms, if applicable.'),
});

export type CalculateCalorieBurnInput = z.infer<typeof CalculateCalorieBurnInputSchema>;

const CalculateCalorieBurnOutputSchema = z.object({
  caloriesBurned: z
    .number()
    .describe('Estimated number of calories burned during the exercise.'),
});

export type CalculateCalorieBurnOutput = z.infer<typeof CalculateCalorieBurnOutputSchema>;

export async function calculateCalorieBurn(input: CalculateCalorieBurnInput): Promise<CalculateCalorieBurnOutput> {
  return calculateCalorieBurnFlow(input);
}

const calculateCalorieBurnPrompt = ai.definePrompt({
  name: 'calculateCalorieBurnPrompt',
  input: {schema: CalculateCalorieBurnInputSchema},
  output: {schema: CalculateCalorieBurnOutputSchema},
  prompt: `You are an AI assistant specialized in calculating calorie burn for exercises.

  Given the following information, calculate the estimated calories burned:

  - MET Value: {{{met}}}
  - User Weight (kg): {{{weightKg}}}
  - Duration (minutes): {{{durationMinutes}}}
  {{#if additionalWeightKg}}
  - Additional Weight (kg): {{{additionalWeightKg}}}
  {{/if}}

  Use the following formula to calculate calories burned:

  Calories Burned = (MET * 3.5 * weightKg) / 200 * durationMinutes

  Return the result as a number representing the total calories burned.
  `,
});

const calculateCalorieBurnFlow = ai.defineFlow(
  {
    name: 'calculateCalorieBurnFlow',
    inputSchema: CalculateCalorieBurnInputSchema,
    outputSchema: CalculateCalorieBurnOutputSchema,
  },
  async input => {
    const {output} = await calculateCalorieBurnPrompt(input);
    return output!;
  }
);
