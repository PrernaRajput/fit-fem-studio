'use server';

import {
  generatePersonalizedWorkoutPlan,
  type GeneratePersonalizedWorkoutPlanInput,
} from '@/ai/flows/personalized-workout-plan';
import {
  getStructuredDailyWorkout,
} from '@/ai/flows/daily-workout';
import {
  analyzeFood,
} from '@/ai/ai-food-logger';
import {
  lookupFoodByBarcode,
} from '@/ai/ai-barcode-food-lookup';
import {
  analyzeFoodImage as analyzeFoodImageFlow,
} from '@/ai/ai-food-image-analyzer';

import { z } from 'zod';
import { AnalyzeFoodInputSchema, type AnalyzeFoodInput, type AnalyzeFoodOutput, LookupFoodByBarcodeInputSchema } from '@/lib/types';


const workoutPlanSchema = z.object({
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
) {
  const validation = workoutPlanSchema.safeParse(data);
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

const dailyWorkoutInputSchema = z.object({
    weeklyWorkoutPlan: z.string(),
    today: z.string(),
});

export async function getDailyWorkout(
    input: z.infer<typeof dailyWorkoutInputSchema>
  ) {
    try {
      const dailyWorkout = await getStructuredDailyWorkout(input);
      return { success: true, data: dailyWorkout, error: null };
    } catch (e) {
      console.error(e);
      return { success: false, data: null, error: 'An unexpected error occurred while generating the daily workout. Please try again.' };
    }
}

export async function getFoodAnalysis(
  query: AnalyzeFoodInput
): Promise<{ success: boolean; data: AnalyzeFoodOutput | null; error: string | null }> {
  const validation = AnalyzeFoodInputSchema.safeParse(query);
  if (!validation.success) {
    return { success: false, data: null, error: validation.error.flatten().fieldErrors.query?.[0] || 'Invalid input.' };
  }

  try {
    const foodData = await analyzeFood(validation.data);
    return { success: true, data: foodData, error: null };
  } catch (e) {
    console.error(e);
    return { success: false, data: null, error: 'An unexpected error occurred while analyzing the food. Please try again.' };
  }
}

export async function getFoodFromBarcode(
  barcode: string
): Promise<{ success: boolean; data: AnalyzeFoodOutput | null; error: string | null }> {
  const validation = LookupFoodByBarcodeInputSchema.safeParse({ barcode });
  if (!validation.success) {
    return { success: false, data: null, error: 'Invalid barcode format.' };
  }

  try {
    const foodData = await lookupFoodByBarcode(validation.data);
    return { success: true, data: foodData, error: null };
  } catch (e) {
    console.error(e);
    return { success: false, data: null, error: 'An unexpected error occurred while looking up the barcode. Please try again.' };
  }
}

export async function analyzeFoodImage(
    imageDataUri: string
  ): Promise<{ success: boolean; data: AnalyzeFoodOutput | null; error: string | null }> {
    if (!imageDataUri) {
      return { success: false, data: null, error: 'No image data provided.' };
    }
  
    try {
      const foodData = await analyzeFoodImageFlow({ photoDataUri: imageDataUri });
      return { success: true, data: foodData, error: null };
    } catch (e) {
      console.error(e);
      return { success: false, data: null, error: 'An unexpected error occurred while analyzing the image. Please try again.' };
    }
  }
