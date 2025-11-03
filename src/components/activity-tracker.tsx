'use client';

import React, { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from './ui/button';
import { Footprints, Target, Info, BedDouble, CalendarHeart, Ruler, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    ChartContainer,
    ChartTooltipContent,
  } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { addDays, subDays, format, startOfWeek, isSameDay, getDay } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { cn } from '@/lib/utils';


const mockHourlyData = [
    { hour: '6am', steps: 150 },
    { hour: '7am', steps: 600 },
    { hour: '8am', steps: 1200 },
    { hour: '9am', steps: 800 },
    { hour: '10am', steps: 300 },
    { hour: '11am', steps: 400 },
    { hour: '12pm', steps: 1500 },
    { hour: '1pm', steps: 700 },
    { hour: '2pm', steps: 350 },
    { hour: '3pm', steps: 250 },
    { hour: '4pm', steps: 450 },
    { hour: '5pm', steps: 1800 },
    { hour: '6pm', steps: 2200 },
    { hour: '7pm', steps: 900 },
  ];

const totalSteps = mockHourlyData.reduce((acc, curr) => acc + curr.steps, 0);
const dailyGoal = 10000;
const progress = Math.min((totalSteps / dailyGoal) * 100, 100);

const initialBodyMeasurements = [
    { name: 'Waist', value: '28', unit: 'in' },
    { name: 'Hips', value: '38', unit: 'in' },
    { name: 'Thigh', value: '21', unit: 'in' },
    { name: 'Arm', value: '11', unit: 'in' },
    { name: 'Chest', value: '34', unit: 'in' },
];

const getCyclePhase = (cycleDay: number) => {
    if (cycleDay >= 1 && cycleDay <= 5) return { name: 'Menstrual', color: 'bg-red-400/30' };
    if (cycleDay >= 6 && cycleDay <= 13) return { name: 'Follicular', color: 'bg-blue-400/30' };
    if (cycleDay >= 14 && cycleDay <= 15) return { name: 'Ovulation', color: 'bg-purple-400/30' };
    if (cycleDay >= 16 && cycleDay <= 28) return { name: 'Luteal', color: 'bg-yellow-400/30' };
    return { name: 'Unknown', color: 'bg-muted' };
};


export function ActivityTracker() {
    const [bodyMeasurements, setBodyMeasurements] = useState(initialBodyMeasurements);
    const [tempMeasurements, setTempMeasurements] = useState(initialBodyMeasurements);
    const [idealSleepHours, setIdealSleepHours] = useState(8);
    const [tempIdealSleep, setTempIdealSleep] = useState(8);

    // Cycle tracking state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [displayWeek, setDisplayWeek] = useState(startOfWeek(new Date()));
    const [loggedPeriodDays, setLoggedPeriodDays] = useState<Date[]>([]);
    const [cycleStartDay] = useState(subDays(new Date(), 13)); // Mock cycle started 13 days ago

    const dayInCycle = Math.floor((new Date().getTime() - cycleStartDay.getTime()) / (1000 * 3600 * 24)) + 1;
    const currentPhase = getCyclePhase(dayInCycle);

    const handleMeasurementChange = (index: number, value: string) => {
        const newMeasurements = [...tempMeasurements];
        newMeasurements[index].value = value;
        setTempMeasurements(newMeasurements);
    };

    const saveMeasurements = () => {
        setBodyMeasurements(tempMeasurements);
    };

    const saveSleepGoal = () => {
        setIdealSleepHours(tempIdealSleep);
    };

    const handleLogPeriod = (day: Date) => {
        setLoggedPeriodDays(prev => {
          const alreadyLogged = prev.some(d => isSameDay(d, day));
          if (alreadyLogged) {
            return prev.filter(d => !isSameDay(d, day));
          } else {
            return [...prev, day];
          }
        });
      };

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(displayWeek, i));

  return (
    <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-8">
            <Card className="overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                        <Footprints className="h-8 w-8" />
                        Activity Tracker
                    </CardTitle>
                    <CardDescription>Your daily step count and activity trends.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {/* Step Count and Goal */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <div 
                            className="relative h-48 w-48 rounded-full flex items-center justify-center"
                            style={{ background: `conic-gradient(hsl(var(--primary)) ${progress}%, hsl(var(--secondary)) ${progress}%)`}}
                        >
                            <div className="absolute h-[90%] w-[90%] bg-card rounded-full flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-primary">{totalSteps.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">Steps Today</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                            <Target className="h-5 w-5 text-accent" />
                            <span>Daily Goal: {dailyGoal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Hourly Activity Chart */}
                    <div>
                        <h3 className="font-semibold mb-4 text-center text-lg">Hourly Activity</h3>
                        <ChartContainer config={{}} className="h-64 w-full">
                            <BarChart data={mockHourlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} width={40}/>
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="steps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </div>

                    {/* Connection Section */}
                    <div>
                         <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Connect Your Health Apps</AlertTitle>
                            <AlertDescription>
                               For automatic step tracking, connect to your device's health app.
                            </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Button variant="outline">Connect to Apple Health</Button>
                            <Button variant="outline">Connect to Google Fit</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <BedDouble className="h-7 w-7" />
                        Sleep Tracking
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                        <div className='flex justify-around items-center'>
                            <div>
                                <p className="text-lg text-muted-foreground">Sleep Score</p>
                                <p className="text-6xl font-bold text-primary">85</p>
                                <p className="text-sm text-muted-foreground">7h 45m last night</p>
                            </div>
                            <div>
                                <p className="text-lg text-muted-foreground">Your Goal</p>
                                <p className="text-6xl font-bold text-primary">{idealSleepHours}h</p>
                                <p className="text-sm text-muted-foreground">per night</p>
                            </div>
                        </div>
                    </div>
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>AI Sleep Tip</AlertTitle>
                        <AlertDescription>
                            Your sleep quality is good, but aiming for a consistent bedtime might boost your energy levels even more.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Clock className="mr-2 h-4 w-4" />
                                Set Sleep Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Set Your Ideal Sleep Goal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sleep-hours">Ideal Hours of Sleep</Label>
                                    <Input
                                        id="sleep-hours"
                                        type="number"
                                        value={tempIdealSleep}
                                        onChange={(e) => setTempIdealSleep(Number(e.target.value))}
                                        placeholder="e.g., 8"
                                    />
                                </div>
                            </div>
                            <DialogClose asChild>
                                <Button onClick={saveSleepGoal} className="w-full">Save Goal</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>

            <Card className="overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <CalendarHeart className="h-7 w-7" />
                        Cycle Tracking
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className={cn("text-center p-4 rounded-lg", currentPhase.color)}>
                        <p className="font-semibold">{currentPhase.name} Phase</p>
                        <p className="text-sm">Day {dayInCycle} of your cycle</p>
                    </div>

                    <div className="relative">
                        <Carousel opts={{
                            align: "start",
                            dragFree: true,
                        }}>
                            <CarouselContent className="-ml-4">
                                {weekDays.map((day, index) => {
                                    const isPeriodDay = loggedPeriodDays.some(d => isSameDay(d, day));
                                    const isToday = isSameDay(day, currentDate);
                                    return (
                                        <CarouselItem key={index} className="basis-1/7 pl-4">
                                            <div 
                                                className="flex flex-col items-center justify-center cursor-pointer space-y-1"
                                                onClick={() => handleLogPeriod(day)}
                                            >
                                                <span className="text-xs text-muted-foreground">{format(day, 'EEE')}</span>
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                                                    isToday && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background',
                                                    isPeriodDay && 'bg-accent text-accent-foreground',
                                                    !isToday && !isPeriodDay && 'hover:bg-muted'
                                                )}>
                                                    {format(day, 'd')}
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    );
                                })}
                            </CarouselContent>
                            <div className="absolute top-1/2 -translate-y-1/2 -left-8">
                                <Button variant="ghost" size="icon" onClick={() => setDisplayWeek(subDays(displayWeek, 7))}>
                                    <ChevronLeft/>
                                </Button>
                            </div>
                             <div className="absolute top-1/2 -translate-y-1/2 -right-8">
                                <Button variant="ghost" size="icon" onClick={() => setDisplayWeek(addDays(displayWeek, 7))}>
                                    <ChevronRight/>
                                </Button>
                            </div>
                        </Carousel>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Log Your Period</AlertTitle>
                        <AlertDescription>
                            Tap on a day to log your period. This helps predict your next cycle. Your next predicted period starts in {28 - dayInCycle} days.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Ruler className="h-7 w-7" />
                        Body Measurements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                    {bodyMeasurements.map((measurement, index) => (
                        <React.Fragment key={measurement.name}>
                        <div className="flex justify-between items-center py-2">
                            <p className="font-medium">{measurement.name}</p>
                            <p className="text-muted-foreground font-semibold">{measurement.value} {measurement.unit}</p>
                        </div>
                        {index < bodyMeasurements.length - 1 && <Separator />}
                        </React.Fragment>
                    ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">Update Measurements</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Body Measurements</DialogTitle>
                            </DialogHeader>
                            <div className='space-y-4 py-4'>
                            {tempMeasurements.map((measurement, index) => (
                                <div key={measurement.name} className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor={`measurement-${measurement.name}`} className="col-span-1">{measurement.name}</Label>
                                    <Input
                                        id={`measurement-${measurement.name}`}
                                        type="number"
                                        value={measurement.value}
                                        onChange={(e) => handleMeasurementChange(index, e.target.value)}
                                        className="col-span-2"
                                    />
                                </div>
                            ))}
                            </div>
                            <DialogClose asChild>
                                <Button onClick={saveMeasurements} className="w-full">Save Measurements</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
