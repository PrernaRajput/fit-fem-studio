'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized weekly workout plans.
 *
 * The flow takes into account the user's fitness level, goals, available equipment,
 * and dietary preferences to create a tailored workout schedule.
 *
 * @exports {
 *   generatePersonalizedWorkoutPlan: (input: GeneratePersonalizedWorkoutPlanInput) => Promise<GeneratePersonalizedWorkoutPlanOutput>;
 *   GeneratePersonalizedWorkoutPlanInput: The input type for the flow.
 *   GeneratePersonalizedWorkoutPlanOutput: The output type for the flow.
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedWorkoutPlanInputSchema = z.object({
  fitnessLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user fitness level.'),
  goals: z
    .enum(['weight loss', 'tone', 'maintain', 'muscle gain'])
    .describe('The user fitness goals.'),
  availableEquipment: z
    .string()
    .describe(
      'A comma-separated list of equipment available to the user. If no equipment is available, specify "none".'
    ),
  dietaryPreferences: z
    .string()
    .describe(
      'The user dietary preferences, such as vegetarian, vegan, or gluten-free. If the user has no dietary preferences, specify "none".'
    ),
});

export type GeneratePersonalizedWorkoutPlanInput = z.infer<
  typeof GeneratePersonalizedWorkoutPlanInputSchema
>;

const GeneratePersonalizedWorkoutPlanOutputSchema = z.object({
  weeklyWorkoutPlan: z
    .string()
    .describe(
      'A detailed weekly workout plan tailored to the user fitness level, goals, available equipment, and dietary preferences.'
    ),
});

export type GeneratePersonalizedWorkoutPlanOutput = z.infer<
  typeof GeneratePersonalizedWorkoutPlanOutputSchema
>;

const personalizedWorkoutPlanPrompt = ai.definePrompt({
  name: 'personalizedWorkoutPlanPrompt',
  input: {schema: GeneratePersonalizedWorkoutPlanInputSchema},
  output: {schema: GeneratePersonalizedWorkoutPlanOutputSchema},
  prompt: `You are an expert fitness coach. Generate a personalized weekly workout plan for the user, considering the following information:

Fitness Level: {{{fitnessLevel}}}
Goals: {{{goals}}}
Available Equipment: {{{availableEquipment}}}
Dietary Preferences: {{{dietaryPreferences}}}

The workout plan should be detailed and include specific exercises, sets, reps, and rest times. Also, provide a justification for why this plan is effective for the user goals. Take dietary preferences into account and provide some basic guidelines.
`,
});

const generatePersonalizedWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedWorkoutPlanFlow',
    inputSchema: GeneratePersonalizedWorkoutPlanInputSchema,
    outputSchema: GeneratePersonalizedWorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await personalizedWorkoutPlanPrompt(input);
    return output!;
  }
);

export async function generatePersonalizedWorkoutPlan(
  input: GeneratePersonalizedWorkoutPlanInput
): Promise<GeneratePersonalizedWorkoutPlanOutput> {
  return generatePersonalizedWorkoutPlanFlow(input);
}
