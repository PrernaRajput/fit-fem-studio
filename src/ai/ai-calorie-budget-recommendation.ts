'use server';
/**
 * @fileOverview Recommends a daily calorie intake based on user goals and tracks remaining calories.
 *
 * - recommendCalories - A function that recommends a daily calorie intake.
 * - RecommendCaloriesInput - The input type for the recommendCalories function.
 * - RecommendCaloriesOutput - The return type for the recommendCalories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendCaloriesInputSchema = z.object({
  goal: z
    .enum(['weight loss', 'maintain', 'gain'])
    .describe('The user goal: weight loss, maintain, or gain.'),
  dailyCaloriesBurned: z
    .number()
    .describe('The number of calories the user burned today.'),
  dailyCaloriesIntake: z
    .number()
    .describe('The number of calories the user consumed today.'),
  weightInKilograms: z.number().describe('The user weight in kilograms.'),
  heightInCentimeters: z.number().describe('The user height in centimeters.'),
  ageInYears: z.number().describe('The user age in years.'),
  gender: z.enum(['male', 'female']).describe('The user gender.'),
  activityLevel:
    z.enum(['sedentary', 'lightly active', 'moderately active', 'very active', 'extra active']).describe('The user activity level'),
});
export type RecommendCaloriesInput = z.infer<typeof RecommendCaloriesInputSchema>;

const RecommendCaloriesOutputSchema = z.object({
  recommendedDailyCalorieIntake: z
    .number()
    .describe('The recommended daily calorie intake for the user.'),
  remainingCalories: z
    .number()
    .describe('The remaining calories for the user today.'),
  goalDeficit: z
    .number()
    .optional()
    .describe('The calorie deficit or surplus based on the user goal.'),
});
export type RecommendCaloriesOutput = z.infer<typeof RecommendCaloriesOutputSchema>;

const calculateBMR = (input: RecommendCaloriesInput): number => {
  const {
    weightInKilograms: weight,
    heightInCentimeters: height,
    ageInYears: age,
    gender,
  } = input;

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return bmr;
};

const calculateDailyCalorieIntake = (input: RecommendCaloriesInput, bmr: number): number => {
  const {
    activityLevel,
    goal,
  } = input;

  let activityFactor;
  switch (activityLevel) {
    case 'sedentary':
      activityFactor = 1.2;
      break;
    case 'lightly active':
      activityFactor = 1.375;
      break;
    case 'moderately active':
      activityFactor = 1.55;
      break;
    case 'very active':
      activityFactor = 1.725;
      break;
    case 'extra active':
      activityFactor = 1.9;
      break;
    default:
      activityFactor = 1.2;
  }

  let calorieIntake = bmr * activityFactor;

  // Adjust calorie intake based on the user goal.
  if (goal === 'weight loss') {
    calorieIntake -= 500; // Reduce calorie intake by 500 calories for weight loss.
  } else if (goal === 'gain') {
    calorieIntake += 500; // Increase calorie intake by 500 calories for weight gain.
  }

  return calorieIntake;
};

export async function recommendCalories(input: RecommendCaloriesInput): Promise<RecommendCaloriesOutput> {
  return recommendCaloriesFlow(input);
}

const recommendCaloriesFlow = ai.defineFlow(
  {
    name: 'recommendCaloriesFlow',
    inputSchema: RecommendCaloriesInputSchema,
    outputSchema: RecommendCaloriesOutputSchema,
  },
  async input => {
    const bmr = calculateBMR(input);
    const recommendedDailyCalorieIntake = Math.round(calculateDailyCalorieIntake(input, bmr));
    const remainingCalories = recommendedDailyCalorieIntake - input.dailyCaloriesIntake + input.dailyCaloriesBurned;

    let goalDeficit: number | undefined = undefined;
    if (input.goal === 'weight loss') {
      goalDeficit = input.dailyCaloriesIntake - input.dailyCaloriesBurned - recommendedDailyCalorieIntake;
    } else if (input.goal === 'gain') {
      goalDeficit = input.dailyCaloriesIntake - input.dailyCaloriesBurned - recommendedDailyCalorieIntake;
    }

    return {
      recommendedDailyCalorieIntake,
      remainingCalories,
      goalDeficit,
    };
  }
);
