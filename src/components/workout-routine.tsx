'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipForward,
  Youtube,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Settings,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useUser, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { format } from 'date-fns';

type Exercise = {
  name: string;
  duration: number;
  gifUrl: string;
  youtubeUrl: string;
  calories: number;
  imageHint: string;
};

type WorkoutRoutineProps = {
  initialExercises: Exercise[];
};

export function WorkoutRoutine({ initialExercises }: WorkoutRoutineProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  
  const [routine, setRoutine] = useState(initialExercises);
  const [timeLeft, setTimeLeft] = useState(initialExercises[0]?.duration ?? 0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleWorkoutCompletion = () => {
    setWorkoutFinished(true);
    speak('Workout complete! Well done.');

    if (user && firestore) {
      const todayString = format(new Date(), 'yyyy-MM-dd');
      const dailyBudgetRef = doc(firestore, 'users', user.uid, 'calorieBudgets', todayString);
      const totalCalories = routine.reduce((acc, curr) => acc + curr.calories, 0);

      setDocumentNonBlocking(dailyBudgetRef, {
        caloriesBurned: increment(totalCalories),
        workoutsDone: increment(1)
      }, { merge: true });
    }
  };

  useEffect(() => {
    if (isPaused || workoutFinished) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (currentExerciseIndex < routine.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setTimeLeft(routine[currentExerciseIndex + 1].duration);
            speak(`Next exercise: ${routine[currentExerciseIndex + 1].name}`);
          } else {
            handleWorkoutCompletion();
          }
          return 0;
        }

        if (prevTime > 1 && prevTime <= 6) {
          speak((prevTime - 1).toString());
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPaused, currentExerciseIndex, workoutFinished, routine]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      // Cancel any ongoing speech to prevent overlap
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentExercise = routine[currentExerciseIndex];
  const progress = currentExercise ? (currentExercise.duration - timeLeft) / currentExercise.duration * 100 : 0;

  const handleSkip = () => {
    if (currentExerciseIndex < routine.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimeLeft(routine[currentExerciseIndex + 1].duration);
    } else {
      handleWorkoutCompletion();
    }
  };

  const handlePlayPause = () => {
      if(workoutFinished || !currentExercise) return;
      
      const newIsPaused = !isPaused;
      setIsPaused(newIsPaused);

      if (newIsPaused) {
        speak('Workout paused');
        window.speechSynthesis.cancel();
      } else {
        speak(`Starting ${currentExercise.name}`);
      }
  };
  
  const handleTimeChange = (index: number, newDuration: number) => {
    const updatedRoutine = [...routine];
    updatedRoutine[index].duration = newDuration;
    setRoutine(updatedRoutine);
    if(index === currentExerciseIndex) {
        setTimeLeft(newDuration);
    }
  };

  const restartWorkout = () => {
    setRoutine(initialExercises);
    setCurrentExerciseIndex(0);
    setTimeLeft(initialExercises[0]?.duration ?? 0);
    setWorkoutFinished(false);
    setIsPaused(true);
  }

  if (workoutFinished) {
    const totalTime = routine.reduce((acc, curr) => acc + curr.duration, 0);
    const totalCalories = routine.reduce((acc, curr) => acc + curr.calories, 0);
    return (
      <div className="container mx-auto px-4 text-center">
        <Card className="max-w-md mx-auto shadow-lg animate-in fade-in-50 duration-500 border-primary/20">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">Workout Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
                <p>Total time: <span className="font-bold">{Math.floor(totalTime / 60)}m {totalTime % 60}s</span></p>
                <p>Calories burned: <span className="font-bold">~{totalCalories} kcal</span></p>
                <p>Exercises completed: <span className="font-bold">{routine.filter(e => e.name !== 'Rest').length}</span></p>
                <Alert className="text-left">
                    <AlertTitle>Remember to hydrate!</AlertTitle>
                    <AlertDescription>Great job! Drink plenty of water to recover.</AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button onClick={restartWorkout} size="lg" className="w-full">
                    Start Again
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentExercise) {
    return (
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-md mx-auto shadow-lg border-primary/20">
              <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">No Workout Loaded</CardTitle>
              </CardHeader>
              <CardContent>
                <p>There are no exercises in the current routine.</p>
              </CardContent>
          </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-2xl mx-auto overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
        <CardHeader className="p-0 relative">
          <div className="w-full aspect-video relative">
            {showYoutube && currentExercise.youtubeUrl ? (
                <div className="w-full h-full">
                    <iframe
                        src={currentExercise.youtubeUrl + '?autoplay=1'}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 z-10" onClick={() => setShowYoutube(false)}><X className="text-white" /></Button>
                </div>
            ) : (
                currentExercise.gifUrl && (
                    <Image
                      src={currentExercise.gifUrl}
                      alt={currentExercise.name}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                      data-ai-hint={currentExercise.imageHint}
                      unoptimized
                    />
                )
            )}
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-3xl font-bold text-white text-shadow-lg">{currentExercise.name}</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="text-6xl font-bold text-primary tabular-nums">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                 <div className="flex items-center gap-2">
                    {currentExercise.youtubeUrl && (
                        <Button variant="outline" size="icon" onClick={() => setShowYoutube(!showYoutube)}>
                            <Youtube />
                            <span className="sr-only">Watch Video</span>
                        </Button>
                    )}
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon"><Settings /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Routine</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                                {routine.map((ex, index) => (
                                <div key={index} className="flex items-center justify-between gap-4 p-2 rounded-md bg-muted/50">
                                    <Label htmlFor={`duration-${index}`} className="flex-1">{ex.name}</Label>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => handleTimeChange(index, Math.max(5, ex.duration - 5))}><Minus className="w-4 h-4"/></Button>
                                        <Input
                                            id={`duration-${index}`}
                                            type="number"
                                            value={ex.duration}
                                            onChange={(e) => handleTimeChange(index, e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                            className="w-20 text-center"
                                            step={5}
                                        />
                                        <Button size="icon" variant="ghost" onClick={() => handleTimeChange(index, ex.duration + 5)}><Plus className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                                ))}
                            </div>
                             <DialogClose asChild>
                                <Button className='mt-4'>Done</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX /> : <Volume2 />}
                        <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </Button>
                </div>
            </div>

          <Progress value={progress} className="h-3" />

          <div className="flex items-center justify-center gap-4">
            <Button onClick={handlePlayPause} size="lg" className="w-32">
              {isPaused ? <Play className="mr-2"/> : <Pause className="mr-2" />}
              {isPaused ? 'Start' : 'Pause'}
            </Button>
            <Button onClick={handleSkip} size="lg" variant="secondary" className="w-32">
              <SkipForward className="mr-2" />
              Skip
            </Button>
          </div>

          <div className="text-center text-muted-foreground">
            Next: {currentExerciseIndex < routine.length - 1 ? routine[currentExerciseIndex + 1].name : 'Finish'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    