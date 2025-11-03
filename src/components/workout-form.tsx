'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getWorkoutPlan } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Target, Utensils, Sparkles } from 'lucide-react';
import type { GeneratePersonalizedWorkoutPlanOutput } from '@/ai/flows/personalized-workout-plan';
import type { ZodIssue } from 'zod';

const formSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your fitness level.',
  }),
  goals: z.enum(['weight loss', 'tone', 'maintain', 'muscle gain'], {
    required_error: 'Please select your primary goal.',
  }),
  availableEquipment: z
    .string()
    .min(2, 'Please specify your available equipment, e.g., "dumbbells, resistance bands" or "none".'),
  dietaryPreferences: z
    .string()
    .min(2, 'Please specify your dietary preferences, e.g., "vegetarian" or "none".'),
});

type WorkoutFormProps = {
  onFormSubmit: (plan: GeneratePersonalizedWorkoutPlanOutput | null, error: string | null | ZodIssue[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
};

export function WorkoutForm({ onFormSubmit, setIsLoading, isLoading }: WorkoutFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitnessLevel: undefined,
      goals: undefined,
      availableEquipment: '',
      dietaryPreferences: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    onFormSubmit(null, null);

    const result = await getWorkoutPlan(values);
    if (result.success) {
      onFormSubmit(result.data, null);
    } else {
      if (Array.isArray(result.error)) {
        onFormSubmit(null, result.error);
      } else {
        onFormSubmit(null, result.error);
      }
    }
    setIsLoading(false);
  }

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-primary">
          <Sparkles className="h-8 w-8" />
          Create Your Personalized Plan
        </CardTitle>
        <CardDescription>
          Tell us about yourself, and our AI will craft a unique weekly fitness plan just for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fitnessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Dumbbell className="h-5 w-5 text-accent" />
                      Fitness Level
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current fitness level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Target className="h-5 w-5 text-accent" />
                      Primary Goal
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your main fitness goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weight loss">Weight Loss</SelectItem>
                        <SelectItem value="tone">Tone & Firm</SelectItem>
                        <SelectItem value="maintain">Maintain Fitness</SelectItem>
                        <SelectItem value="muscle gain">Muscle Gain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availableEquipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <Dumbbell className="h-5 w-5 text-accent" />
                    Available Equipment
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Dumbbells, resistance bands, yoga mat, or simply 'none'"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    List any fitness equipment you have access to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <Utensils className="h-5 w-5 text-accent" />
                    Dietary Preferences
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Vegetarian, vegan, gluten-free, or 'none'"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mention any dietary needs or preferences for more tailored advice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Your Plan...
                </>
              ) : (
                'Generate My Plan'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
