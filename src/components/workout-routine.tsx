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

const exercises = [
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

export function WorkoutRoutine() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercises[0].duration);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [routine, setRoutine] = useState(exercises);

  const audioRef = useRef<HTMLAudioElement>(null);

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
            setWorkoutFinished(true);
            speak('Workout complete! Well done.');
          }
          return 0;
        }

        if (prevTime === 6) {
          speak('5 seconds left');
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPaused, currentExerciseIndex, workoutFinished, routine]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentExercise = routine[currentExerciseIndex];
  const progress = (currentExercise.duration - timeLeft) / currentExercise.duration * 100;

  const handleSkip = () => {
    if (currentExerciseIndex < routine.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimeLeft(routine[currentExerciseIndex + 1].duration);
    } else {
      setWorkoutFinished(true);
    }
  };

  const handlePlayPause = () => {
      if(timeLeft === 0 && currentExerciseIndex === routine.length -1) return;
      setIsPaused(!isPaused);
      if (isPaused) {
        speak(`Starting ${currentExercise.name}`);
      } else {
        speak('Workout paused');
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
                <Button onClick={() => {
                    setCurrentExerciseIndex(0);
                    setTimeLeft(routine[0].duration);
                    setWorkoutFinished(false);
                    setIsPaused(true);
                }} size="lg" className="w-full">
                    Start Again
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
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
