'use client';
import { Hero } from '@/components/hero';
import { WorkoutGenerator } from '@/components/workout-generator';
import { Footer } from '@/components/footer';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PersonalizedWorkoutPlan } from '@/components/personalized-workout-plan';
import { WorkoutPlanSkeleton } from '@/components/workout-plan-skeleton';
import { useEffect, useState } from 'react';
import { GeneratePersonalizedWorkoutPlanOutput } from '@/ai/flows/personalized-workout-plan';

export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const [workoutPlan, setWorkoutPlan] = useState<GeneratePersonalizedWorkoutPlanOutput | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'userProfile', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (userProfile?.weeklyWorkoutPlan) {
      setWorkoutPlan({ weeklyWorkoutPlan: userProfile.weeklyWorkoutPlan });
    } else {
      setWorkoutPlan(null);
    }
  }, [userProfile]);

  const isLoading = isUserLoading || (user && isProfileLoading);
  
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <Hero />
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
          {user && !isUserLoading && <WorkoutGenerator setWorkoutPlan={setWorkoutPlan} />}
          <div className="mt-12 min-h-[300px]" id="workout-plan-section">
            { isLoading && <WorkoutPlanSkeleton /> }
            { user && !isLoading && workoutPlan && <PersonalizedWorkoutPlan data={workoutPlan} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
