
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from './ui/button';
import { Footprints, Target, Info, BedDouble, CalendarHeart, Ruler, Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import {
    ChartContainer,
    ChartTooltipContent,
  } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { addDays, subDays, format, startOfWeek, isSameDay, differenceInCalendarDays, getMonth, parseISO } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ScrollArea } from './ui/scroll-area';


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
    { name: 'Waist', value: '0', unit: 'in' },
    { name: 'Hips', value: '0', unit: 'in' },
    { name: 'Thigh', value: '0', unit: 'in' },
    { name: 'Arm', value: '0', unit: 'in' },
    { name: 'Chest', value: '0', unit: 'in' },
];

const getCyclePhase = (cycleDay: number) => {
    if (cycleDay >= 1 && cycleDay <= 5) return { name: 'Menstrual', color: 'bg-red-400/30' };
    if (cycleDay >= 6 && cycleDay <= 13) return { name: 'Follicular', color: 'bg-green-400/30' };
    if (cycleDay >= 14 && cycleDay <= 15) return { name: 'Ovulation', color: 'bg-blue-400/30' };
    if (cycleDay >= 16 && cycleDay <= 28) return { name: 'Luteal', color: 'bg-pink-400/30' };
    return { name: 'Unknown', color: 'bg-muted' };
};

const cyclePhases = [
    { 
        name: 'Menstrual', 
        color: 'bg-red-400/30', 
        title: "Menstrual Phase (Days ~1–5)",
        description: `### What happens:\n\nThe endometrium (uterine lining) from the previous cycle breaks down and exits the body.\n\nThis is visible as menstrual blood, a mix of blood, tissue, and mucus.\n\n### Why it happens:\n\nThe corpus luteum from the previous cycle stops producing hormones.\n\nProgesterone and estrogen drop sharply, signaling the body to shed the lining.\n\n### Hormones:\n\n • Estrogen ↓ \n\n • Progesterone ↓ \n\n • FSH (Follicle Stimulating Hormone) slowly begins ↑ to prepare the next phase\n\n### Common symptoms:\n\nCramps (uterus contracts to push lining out)\n\nLower back pain\n\nTiredness\n\nMood changes\n\nFood cravings`
    },
    { 
        name: 'Follicular', 
        color: 'bg-green-400/30',
        title: "Follicular Phase (Days ~1–13)",
        description: `### What happens:\n\nThe pituitary gland releases FSH.\n\nSeveral follicles start growing in the ovaries, each holding an immature egg.\n\nUsually, only one follicle becomes dominant and matures.\n\n### Hormones:\n\n • FSH ↑ stimulates follicle growth.\n\n • Estrogen increases steadily as the follicle matures.\n\n### Inside the uterus:\n\nEstrogen rebuilds and thickens the uterine lining to prepare again for pregnancy.\n\n### Symptoms:\n\nEnergy increases\n\nMood improves\n\nSkin may clear\n\nCervical mucus becomes lighter and wetter\n\nThis phase ends when estrogen peaks and triggers the next phase—ovulation.` 
    },
    { 
        name: 'Ovulation', 
        color: 'bg-blue-400/30',
        title: "Ovulation (Around Day 14)",
        description: `### What happens:\n\nThe LH surge causes the mature follicle to burst, releasing an egg.\n\nThe egg enters the fallopian tube and waits for possible fertilization.\n\nThe egg enters the fallopian tube and waits for possible fertilization.\n\n### Fertility:\n\nEgg survives 12–24 hours once released.\n\nSperm can survive up to 5 days, so fertility is highest in the days before ovulation.\n\n### Hormones:\n\n • Estrogen reaches its highest level → triggers LH surge.\n\n • LH spike releases the egg.\n\n### Signs someone might feel:\n\nIncrease in sex drive\n\nClear, stretchy “egg-white” cervical mucus\n\nSlight rise in basal body temperature\n\nMild ovary pain (called mittelschmerz)\n\nOvulation is the only time pregnancy can occur in the cycle.` 
    },
    { 
        name: 'Luteal', 
        color: 'bg-pink-400/30',
        title: "Luteal Phase (Days ~15–28)",
        description: `### What happens:\n\nThe empty follicle becomes the corpus luteum\n\nIt releases progesterone and some estrogen.\n\nProgesterone thickens the uterine lining even more and keeps it stable.\n\n### If NO pregnancy occurs:\n\nThe corpus luteum breaks down after ~14 days.\n\nProgesterone and estrogen drop.\n\nThe drop triggers the uterus to shed its lining → next period starts.\n\n### If pregnancy DOES occur:\n\nThe body produces hCG (pregnancy hormone) to keep the corpus luteum alive.\n\nProgesterone stays high.\n\nNo period occurs.\n\n### Common PMS symptoms during luteal phase:\n\nBloating\n\nBreast tenderness\n\nIrritability or mood swings\n\nHeadaches\n\nCravings\n\nAcne` 
    },
];

type BodyMeasurement = {
    name: string;
    value: string;
    unit: string;
};

export function ActivityTracker() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, 'users', user.uid, 'userProfile', user.uid);
    }, [user, firestore]);
  
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

    const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(initialBodyMeasurements);
    const [tempMeasurements, setTempMeasurements] = useState<BodyMeasurement[]>(initialBodyMeasurements);
    const [idealSleepHours, setIdealSleepHours] = useState(8);
    const [tempIdealSleep, setTempIdealSleep] = useState(8);

    const [currentDate] = useState(new Date());
    const [displayWeek, setDisplayWeek] = useState(startOfWeek(new Date()));
    const [loggedPeriodDays, setLoggedPeriodDays] = useState<Date[]>([]);
    
    const [cycleStartDay, setCycleStartDay] = useState(subDays(new Date(), 13)); 
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    useEffect(() => {
        if (userProfile) {
            setBodyMeasurements(userProfile.bodyMeasurements || initialBodyMeasurements);
            setTempMeasurements(userProfile.bodyMeasurements || initialBodyMeasurements);
            setIdealSleepHours(userProfile.idealSleepHours || 8);
            setTempIdealSleep(userProfile.idealSleepHours || 8);
            
            const savedPeriodDays = (userProfile.loggedPeriodDays || []).map((day: any) => 
                day.toDate ? day.toDate() : parseISO(day)
            );
            savedPeriodDays.sort((a: { getTime: () => number; }, b: { getTime: () => number; }) => a.getTime() - b.getTime());
            setLoggedPeriodDays(savedPeriodDays);

            if (savedPeriodDays.length > 0) {
                setCycleStartDay(savedPeriodDays[0]);
            }
        }
    }, [userProfile]);

    const dayInCycle = useMemo(() => {
        return differenceInCalendarDays(currentDate, cycleStartDay) % 28 + 1;
    }, [currentDate, cycleStartDay]);

    const currentPhase = useMemo(() => getCyclePhase(dayInCycle), [dayInCycle]);

    const handleMeasurementChange = (index: number, value: string) => {
        const newMeasurements = [...tempMeasurements];
        newMeasurements[index].value = value;
        setTempMeasurements(newMeasurements);
    };

    const saveMeasurements = () => {
        setBodyMeasurements(tempMeasurements);
        if (userProfileRef) {
            setDocumentNonBlocking(userProfileRef, { bodyMeasurements: tempMeasurements }, { merge: true });
        }
    };

    const saveSleepGoal = () => {
        setIdealSleepHours(tempIdealSleep);
        if (userProfileRef) {
            setDocumentNonBlocking(userProfileRef, { idealSleepHours: tempIdealSleep }, { merge: true });
        }
    };

    const handleLogPeriod = (day: Date) => {
        const newLoggedDays = loggedPeriodDays.some(d => isSameDay(d, day))
          ? loggedPeriodDays.filter(d => !isSameDay(d, day))
          : [...loggedPeriodDays, day];
        
        newLoggedDays.sort((a, b) => a.getTime() - b.getTime());
        setLoggedPeriodDays(newLoggedDays);
        
        if (userProfileRef) {
            setDocumentNonBlocking(userProfileRef, { loggedPeriodDays: newLoggedDays }, { merge: true });
        }

        if (newLoggedDays.length > 0) {
          setCycleStartDay(newLoggedDays[0]);
        } else {
          setCycleStartDay(subDays(new Date(), 13));
        }
      };

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(displayWeek, i));

    const DayWithCycleColor = ({ date, displayMonth }: { date: Date; displayMonth: Date }) => {
        const isPeriodDay = loggedPeriodDays.some(d => isSameDay(d, date));
        const dayOfCycle = (differenceInCalendarDays(date, cycleStartDay) % 28 + 1 + 28) % 28;
        const phaseForDay = getCyclePhase(dayOfCycle);
        const isCurrentMonth = getMonth(date) === getMonth(displayMonth);
    
        return (
          <div className={cn(
            "relative h-9 w-9 flex items-center justify-center rounded-md",
            isPeriodDay ? 'bg-accent text-accent-foreground' : phaseForDay.color,
            !isCurrentMonth && "text-muted-foreground opacity-50",
            isSameDay(date, currentDate) && "ring-2 ring-primary"
          )}>
            {format(date, 'd')}
          </div>
        );
      };
      
    const nextPredictedPeriodStart = useMemo(() => {
        return addDays(cycleStartDay, 28);
    }, [cycleStartDay]);

  if (isProfileLoading) {
      return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

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
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                            <CalendarHeart className="h-7 w-7" />
                            Cycle Tracking
                        </CardTitle>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <CalendarIcon className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    month={calendarMonth}
                                    onMonthChange={setCalendarMonth}
                                    mode="single"
                                    selected={currentDate}
                                    onDayClick={handleLogPeriod}
                                    components={{ Day: DayWithCycleColor }}
                                    className="rounded-md border"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className={cn("text-center p-4 rounded-lg", currentPhase.color)}>
                        <p className="font-semibold">{currentPhase.name} Phase</p>
                        <p className="text-sm">Day {dayInCycle} of your cycle</p>
                    </div>

                    <div className="relative px-8">
                        <Carousel opts={{ align: "start", dragFree: true }}>
                            <CarouselContent className="-ml-4">
                                {weekDays.map((day, index) => {
                                    const isPeriodDay = loggedPeriodDays.some(d => isSameDay(d, day));
                                    const isToday = isSameDay(day, currentDate);
                                    const dayOfCycleForBubble = (differenceInCalendarDays(day, cycleStartDay) % 28 + 1 + 28) % 28;
                                    const phaseForBubble = getCyclePhase(dayOfCycleForBubble);
                                    
                                    return (
                                        <CarouselItem key={index} className="basis-[14.28%] pl-4">
                                            <div 
                                                className="flex flex-col items-center justify-center cursor-pointer space-y-1"
                                                onClick={() => handleLogPeriod(day)}
                                            >
                                                <span className="text-xs text-muted-foreground">{format(day, 'EEE')}</span>
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                                                    isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                                                    isPeriodDay ? 'bg-accent text-accent-foreground' : phaseForBubble.color,
                                                    !isPeriodDay && 'hover:bg-muted'
                                                )}>
                                                    {format(day, 'd')}
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    );
                                })}
                            </CarouselContent>
                            <div className="absolute top-1/2 -translate-y-1/2 -left-4">
                                <Button variant="ghost" size="icon" onClick={() => setDisplayWeek(subDays(displayWeek, 7))}>
                                    <ChevronLeft/>
                                </Button>
                            </div>
                             <div className="absolute top-1/2 -translate-y-1/2 -right-4">
                                <Button variant="ghost" size="icon" onClick={() => setDisplayWeek(addDays(displayWeek, 7))}>
                                    <ChevronRight/>
                                </Button>
                            </div>
                        </Carousel>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs px-2">
                        {cyclePhases.map(phase => (
                            <Dialog key={phase.name}>
                                <DialogTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <div className={cn("w-3 h-3 rounded-full", phase.color)} />
                                        <span>{phase.name}</span>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{phase.title}</DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="h-96">
                                        <div className="prose prose-sm prose-p:my-1 prose-headings:my-2 max-w-none whitespace-pre-wrap dark:prose-invert p-4">
                                            {phase.description.split('\n\n').map((paragraph, pIndex) => (
                                                <p key={pIndex}>
                                                    {paragraph.split('\n').map((line, lIndex) => {
                                                        if (line.startsWith('### ')) {
                                                            return <strong key={lIndex} className="block font-bold mt-2">{line.substring(4)}</strong>;
                                                        }
                                                        return <React.Fragment key={lIndex}>{line}<br /></React.Fragment>;
                                                    })}
                                                </p>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        ))}
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-accent" />
                            <span>Period Logged</span>
                        </div>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Log Your Period</AlertTitle>
                        <AlertDescription>
                            Tap on a day to log your period. Your next predicted period starts around {format(nextPredictedPeriodStart, 'MMMM do')}.
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
                <CardContent className="space-y-4">
                    {bodyMeasurements.map((measurement, index) => (
                        <div key={index} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                            <span className="font-medium text-muted-foreground">{measurement.name}</span>
                            <span className="font-bold text-lg text-primary">{measurement.value} {measurement.unit}</span>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Ruler className="mr-2 h-4 w-4" />
                                Update Measurements
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Your Measurements</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {tempMeasurements.map((measurement, index) => (
                                    <div key={index} className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor={`measurement-${index}`} className="text-right">
                                            {measurement.name}
                                        </Label>
                                        <Input
                                            id={`measurement-${index}`}
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

    