'use client';
import { Hero } from '@/components/hero';
import { WorkoutGenerator } from '@/components/workout-generator';
import { Footer } from '@/components/footer';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PersonalizedWorkoutPlan } from '@/components/personalized-workout-plan';
import { WorkoutPlanSkeleton } from '@/components/workout-plan-skeleton';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const [shouldRenderGenerator, setShouldRenderGenerator] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'userProfile', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    // If the user has a plan, we don't immediately show the generator.
    // A state change in the generator component will reveal it if needed.
    if (user && !isUserLoading && !isProfileLoading) {
        if (!userProfile?.weeklyWorkoutPlan) {
            setShouldRenderGenerator(true);
        }
    }
  }, [user, isUserLoading, isProfileLoading, userProfile]);

  const isLoading = isUserLoading || (user && isProfileLoading);
  
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <Hero />
        { isLoading && (
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
                <WorkoutPlanSkeleton />
            </div>
        )}
        { user && !isLoading && userProfile && userProfile.weeklyWorkoutPlan && (
             <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
                <PersonalizedWorkoutPlan data={{ weeklyWorkoutPlan: userProfile.weeklyWorkoutPlan }} />
             </div>
        )}
        { (shouldRenderGenerator || (user && !isLoading && !userProfile?.weeklyWorkoutPlan)) && <WorkoutGenerator /> }
      </main>
      <Footer />
    </div>
  );
}
