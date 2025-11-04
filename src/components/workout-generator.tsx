'use client';

import { useState } from 'react';
import { WorkoutForm } from '@/components/workout-form';
import { PersonalizedWorkoutPlan } from '@/components/personalized-workout-plan';
import { WorkoutPlanSkeleton } from '@/components/workout-plan-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import type { GeneratePersonalizedWorkoutPlanOutput } from '@/ai/flows/personalized-workout-plan';
import type { ZodIssue } from 'zod';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

type WorkoutGeneratorProps = {
  setWorkoutPlan: (plan: GeneratePersonalizedWorkoutPlanOutput | null) => void;
};


export function WorkoutGenerator({ setWorkoutPlan }: WorkoutGeneratorProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (plan: GeneratePersonalizedWorkoutPlanOutput | null, err: string | null | ZodIssue[]) => {
    if (typeof err === 'string' || err === null) {
      setError(err);
    } else if (Array.isArray(err)) {
      setError("Please check the form for errors.");
    }
    
    // Update parent state
    setWorkoutPlan(plan);
    
    if (plan && plan.weeklyWorkoutPlan && user && firestore) {
      // Save to Firestore using non-blocking update
      const userProfileRef = doc(firestore, 'users', user.uid, 'userProfile', user.uid);
      setDocumentNonBlocking(userProfileRef, { weeklyWorkoutPlan: plan.weeklyWorkoutPlan }, { merge: true });

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('workout-plan-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <WorkoutForm onFormSubmit={handleFormSubmit} setIsLoading={setIsLoading} isLoading={isLoading} />
      
      <div id="workout-plan-section" className="mt-12">
        {isLoading && <WorkoutPlanSkeleton />}
        {error && !isLoading && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* The plan is now displayed by the parent component */}
      </div>
    </div>
  );
}
