'use client';

import { WorkoutRoutine } from '@/components/workout-routine';
import { Footer } from '@/components/footer';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getDailyWorkout } from '../actions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const defaultExercises = [
    {
      name: 'Jumping Jacks',
      duration: 30,
      gifUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3lvb3VmOTUweTZ1d3pmYzBwajBhZGR3c2JrMzQxMWp2dGhwOG80byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ckMk3RKUK29lziaspI/giphy.gif',
      youtubeUrl: 'https://www.youtube.com/embed/c4DAnQ6DtF8',
      calories: 25,
      imageHint: 'jumping jacks',
    },
    {
      name: 'Rest',
      duration: 15,
      gifUrl: 'https://picsum.photos/seed/rest1/600/400',
      youtubeUrl: '',
      calories: 0,
      imageHint: 'woman resting',
    },
    {
      name: 'Squats',
      duration: 45,
      gifUrl: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjY2Mnl4OTQ1ZmdudWd0MWlpY3hlcmNsM3g4NmFjdnc2ZXNuZnNjNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1C1ipHPEs4Vjwglwza/giphy.gif',
      youtubeUrl: 'https://www.youtube.com/embed/x_t89sI3_Hw',
      calories: 40,
      imageHint: 'woman squats',
    },
      {
      name: 'Rest',
      duration: 15,
      gifUrl: 'https://picsum.photos/seed/rest2/600/400',
      youtubeUrl: '',
      calories: 0,
      imageHint: 'woman relaxing',
    },
    {
      name: 'Plank',
      duration: 60,
      gifUrl: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTlkMWg0NWwxczRpc293ZjkxYnc3cDRldjZndXA0czAwNDNycmJvZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d3mlADRlF7SMFQRy/giphy.gif',
      youtubeUrl: 'https://www.youtube.com/embed/pD3-e4I_j4I',
      calories: 30,
      imageHint: 'woman planking',
    },
];

type Exercise = {
  name: string;
  duration: number;
  gifUrl: string;
  youtubeUrl: string;
  calories: number;
  imageHint: string;
};


export default function WorkoutPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'userProfile', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [todaysExercises, setTodaysExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRestDay, setIsRestDay] = useState(false);

  useEffect(() => {
    const fetchDailyWorkout = async () => {
      if (isUserLoading || isProfileLoading) return;

      const plan = userProfile?.weeklyWorkoutPlan;
      
      if (plan) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const result = await getDailyWorkout({ weeklyWorkoutPlan: plan, today });

        if (result.success && result.data) {
            if (!result.data.workoutExists) {
                setIsRestDay(true);
                setTodaysExercises([]);
            } else {
                const mappedExercises: Exercise[] = result.data.steps.map(step => ({
                    name: step.set ? `${step.name} (Set ${step.set})` : step.name,
                    duration: step.duration,
                    gifUrl: `https://picsum.photos/seed/${step.name.replace(/\s/g, '')}/600/400`,
                    youtubeUrl: '',
                    calories: step.isRest ? 0 : Math.floor(step.duration * 0.7),
                    imageHint: step.name.toLowerCase(),
                }));
                setTodaysExercises(mappedExercises);
                setIsRestDay(false);
            }
        } else {
            setError(result.error || "Failed to parse workout. Using default.");
            setTodaysExercises(defaultExercises);
        }
      } else {
        // If no plan is in firestore, use the default workout
        setTodaysExercises(defaultExercises);
      }
    };

    fetchDailyWorkout();
  }, [userProfile, isUserLoading, isProfileLoading]);

  // Unified loading state
  const isLoading = todaysExercises === null && !isRestDay;


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4">Loading your workout...</p>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-background items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Workout</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isRestDay) {
    return (
       <div className="flex flex-col min-h-dvh bg-background">
        <main className="flex-1 py-8 flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">It's Your Rest Day!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your personalized plan has today as a rest day. Enjoy your recovery!
              </p>
              <Link href="/" passHref>
                <Button className="mt-6">Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 py-8">
        {todaysExercises && todaysExercises.length > 0 ? (
          <WorkoutRoutine initialExercises={todaysExercises} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No exercises found for today.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
