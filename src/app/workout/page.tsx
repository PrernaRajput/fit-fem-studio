'use client';

import { WorkoutRoutine } from '@/components/workout-routine';
import { Footer } from '@/components/footer';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

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

// This function will parse the text for a given day into structured exercise data.
// It's designed to be robust against variations in the AI's output format.
function parseTodaysWorkout(plan: string, today: string): Exercise[] {
    const dayRegex = new RegExp(`(?:\\*\\*)?${today}(?:\\*\\*)?:?([\\s\\S]*?)(?=(?:\\*\\*)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Dietary Guidelines|Justification)(?:\\*\\*)?:?|$)`, 'i');
    const match = plan.match(dayRegex);

  if (!match || !match[1] || match[1].trim().toLowerCase().includes('rest')) {
    // If today's workout is rest or not found, return a rest block
     return [{ name: 'Rest Day', duration: 0, gifUrl: '', youtubeUrl: '', calories: 0, imageHint: 'relaxing' }];
  }

  const todaysPlan = match[1];
  const exercises: Exercise[] = [];

  // Regex to find lines like "- Squats: 3 sets of 12 reps" or "- Jumping Jacks (30 seconds)"
  const exerciseRegex = /-\s*(.*?)(?:\s*\((.*?)\)|\s*:\s*(\d+)\s*sets?.*of\s*([\d-]+)\s*reps?)/gi;
  let exerciseMatch;

  while ((exerciseMatch = exerciseRegex.exec(todaysPlan)) !== null) {
    const name = exerciseMatch[1].trim();
    let duration = 45; // Default duration

    if (exerciseMatch[2]) { // Duration format like "(30 seconds)"
      const durationMatch = exerciseMatch[2].match(/(\d+)\s*seconds?/);
      if (durationMatch) {
        duration = parseInt(durationMatch[1], 10);
      }
    } else if (exerciseMatch[3] && exerciseMatch[4]) { // Reps format like "3 sets of 12 reps"
      // This is a rep-based exercise. We'll assign a standard duration for now as the timer is duration-based.
      // A more complex implementation could handle reps differently.
      duration = 45;
    }
    
    // For now, use placeholder GIFs and data, trying to match default exercises where possible
    const defaultExercise = defaultExercises.find(ex => ex.name.toLowerCase() === name.toLowerCase());

    exercises.push({
      name,
      duration,
      gifUrl: defaultExercise?.gifUrl || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/600/400`,
      youtubeUrl: defaultExercise?.youtubeUrl || '',
      calories: Math.floor(duration * 0.7), // Rough calorie estimate
      imageHint: defaultExercise?.imageHint || name.toLowerCase(),
    });

    // Add a rest period after each exercise
    exercises.push({
      name: 'Rest',
      duration: 15,
      gifUrl: 'https://picsum.photos/seed/rest/600/400',
      youtubeUrl: '',
      calories: 0,
      imageHint: 'woman resting',
    });
  }
  
  // Remove the last rest period if it exists
  if (exercises.length > 0 && exercises[exercises.length - 1].name === 'Rest') {
    exercises.pop();
  }
  
  if (exercises.length === 0 && todaysPlan.trim().length > 0 && !todaysPlan.trim().toLowerCase().includes('rest')) {
    // Fallback if regex fails but there's content.
    return defaultExercises;
  }
  
  if(exercises.length === 0) {
    return [{ name: 'Rest Day', duration: 0, gifUrl: '', youtubeUrl: '', calories: 0, imageHint: 'relaxing' }];
  }


  return exercises;
}


export default function WorkoutPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'userProfile', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [todaysExercises, setTodaysExercises] = useState<Exercise[] | null>(null);

  useEffect(() => {
    // This effect runs whenever the profile data from Firestore changes.
    if (isUserLoading || isProfileLoading) {
      // Still loading, do nothing until data is ready.
      // Setting state to null will keep the loading screen up.
      setTodaysExercises(null);
      return;
    };
    
    const plan = userProfile?.weeklyWorkoutPlan;
    if (plan) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const parsedExercises = parseTodaysWorkout(plan, today);
      setTodaysExercises(parsedExercises);
    } else {
      // If no plan is in firestore, use the default workout
      setTodaysExercises(defaultExercises);
    }
  }, [userProfile, isUserLoading, isProfileLoading]);

  // Unified loading state
  const isLoading = todaysExercises === null;


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-background items-center justify-center">
        <p>Loading your workout...</p>
      </div>
    );
  }
  
  if (!todaysExercises || todaysExercises.length === 0 || (todaysExercises.length === 1 && todaysExercises[0].name === 'Rest Day')) {
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
        <WorkoutRoutine initialExercises={todaysExercises} />
      </main>
      <Footer />
    </div>
  );
}
