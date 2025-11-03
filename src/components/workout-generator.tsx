'use client';

import { useState } from 'react';
import { WorkoutForm } from '@/components/workout-form';
import { PersonalizedWorkoutPlan } from '@/components/personalized-workout-plan';
import { WorkoutPlanSkeleton } from '@/components/workout-plan-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import type { GeneratePersonalizedWorkoutPlanOutput } from '@/ai/flows/personalized-workout-plan';
import type { ZodIssue } from 'zod';

export function WorkoutGenerator() {
  const [workoutPlan, setWorkoutPlan] = useState<GeneratePersonalizedWorkoutPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (plan: GeneratePersonalizedWorkoutPlanOutput | null, err: string | null | ZodIssue[]) => {
    if (typeof err === 'string' || err === null) {
      setError(err);
    } else if (Array.isArray(err)) {
      setError("Please check the form for errors.");
    }
    
    setWorkoutPlan(plan);
    
    if (plan) {
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('workout-plan-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <WorkoutForm onFormSubmit={handleFormSubmit} setIsLoading={setIsLoading} isLoading={isLoading} />
        
        <div id="workout-plan-section" className="mt-12 min-h-[300px]">
          {isLoading && <WorkoutPlanSkeleton />}
          {error && !isLoading && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Generation Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {workoutPlan && !isLoading && <PersonalizedWorkoutPlan data={workoutPlan} />}
        </div>
      </div>
    </div>
  );
}
