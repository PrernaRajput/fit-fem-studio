
'use server';

import {
  generatePersonalizedWorkoutPlan,
  type GeneratePersonalizedWorkoutPlanInput,
  type GeneratePersonalizedWorkoutPlanOutput,
} from '@/ai/flows/personalized-workout-plan';
import { z } from 'zod';

const InputSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.enum(['weight loss', 'tone', 'maintain', 'muscle gain']),
  availableEquipment: z
    .string()
    .min(1, 'Please specify your available equipment, e.g., "dumbbells, resistance bands" or "none".'),
  dietaryPreferences: z
    .string()
    .min(1, 'Please specify your dietary preferences, e.g., "vegetarian" or "none".'),
});

export async function getWorkoutPlan(
  data: GeneratePersonalizedWorkoutPlanInput
): Promise<{ success: boolean; data: GeneratePersonalizedWorkoutPlanOutput | null; error: string | null | z.ZodIssue[] }> {
  const validation = InputSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, data: null, error: validation.error.issues };
  }

  try {
    const workoutPlan = await generatePersonalizedWorkoutPlan(validation.data);
    if (!workoutPlan.weeklyWorkoutPlan) {
      return { success: false, data: null, error: 'The AI could not generate a plan with the given inputs. Please try adjusting them.' };
    }
    return { success: true, data: workoutPlan, error: null };
  } catch (e) {
    console.error(e);
    return { success: false, data: null, error: 'An unexpected error occurred while generating your workout plan. Please try again later.' };
  }
}
