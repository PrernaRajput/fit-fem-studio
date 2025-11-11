'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a step-by-step daily workout from a weekly plan.
 *
 * The flow takes a user's weekly workout plan and the current day, then returns a
 * structured JSON object representing the workout for that day, broken down set-by-set.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const startDailyWorkoutPrompt = `
You are an expert fitness trainer AI that runs workouts step-by-step.

You will receive:
1. The user's stored weekly workout plan (as text or JSON).
2. Today's day of the week (e.g., Monday).

Goal:
- Identify which workout corresponds to today.
- Break the workout into a step-by-step execution plan:
  - Warm-up first
  - Then each exercise set by set
  - After each set, include the exact rest time before the next set
- Output in a structured JSON format.

JSON Output Format:
{
  "day": "Monday",
  "workoutExists": true | false,
  "steps": [
    {
      "type": "warmup" | "exercise_set" | "rest",
      "name": "Barbell Bench Press",
      "set": 1,
      "reps": "8",
      "duration": 90,
      "isRest": false
    }
  ]
}

Rules:
- If the user has no workout for today, respond with workoutExists: false.
- Always preserve the actual sets, reps, and rest times from the original workout plan.
- For rest steps, set type to "rest", name to "Rest", and duration to the rest time in seconds. 'isRest' should be true.
- For exercise steps, set 'isRest' to false.
- Do not invent exercises that are not in the original plan.
- If warm-up exists, break it into a single step at the top.
- The 'reps' field should be a string, as it might contain ranges like "6-8".
- The 'duration' field should be the number of seconds for that step (e.g., rest time).

Example behavior:
If today is Monday and the plan says:
Barbell Bench Press: 4 sets of 6-8 reps, 90-120 sec rest

You should output steps for:
- set 1 (exercise_set)
- rest 90 sec (rest)
- set 2 (exercise_set)
- rest 90 sec (rest)
- set 3 (exercise_set)
- rest 90 sec (rest)
- set 4 (exercise_set)

Be consistent and structured.
` as const;

const StartDailyWorkoutInputSchema = z.object({
  weeklyWorkoutPlan: z.string().describe("The user's full weekly workout plan as a string."),
  today: z.string().describe("The current day of the week, e.g., 'Monday'."),
});

const WorkoutStepSchema = z.object({
    type: z.enum(['warmup', 'exercise_set', 'rest']).describe('The type of step.'),
    name: z.string().describe('The name of the step (e.g., "Jumping Jacks", "Rest").'),
    set: z.number().optional().describe('The set number, if applicable.'),
    reps: z.string().optional().describe('The number of reps, as a string (e.g., "8" or "8-10").'),
    duration: z.number().describe('The duration of the step in seconds.'),
    isRest: z.boolean().describe('Whether this step is a rest period.'),
});

const StartDailyWorkoutOutputSchema = z.object({
  day: z.string().describe("The day of the week for the workout."),
  workoutExists: z.boolean().describe("Whether a workout exists for the specified day."),
  steps: z.array(WorkoutStepSchema).describe('A list of steps for the daily workout.'),
});


const dailyWorkoutPrompt = ai.definePrompt({
    name: 'startDailyWorkoutPrompt',
    input: { schema: StartDailyWorkoutInputSchema },
    output: { schema: StartDailyWorkoutOutputSchema },
    prompt: startDailyWorkoutPrompt,
});


const startDailyWorkoutFlow = ai.defineFlow(
  {
    name: 'startDailyWorkoutFlow',
    inputSchema: StartDailyWorkoutInputSchema,
    outputSchema: StartDailyWorkoutOutputSchema,
  },
  async (input) => {
    const { output } = await dailyWorkoutPrompt(input);
    return output!;
  }
);

export async function getStructuredDailyWorkout(
  input: z.infer<typeof StartDailyWorkoutInputSchema>
): Promise<z.infer<typeof StartDailyWorkoutOutputSchema>> {
  return startDailyWorkoutFlow(input);
}
