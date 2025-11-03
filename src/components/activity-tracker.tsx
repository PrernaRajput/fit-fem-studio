'use client';

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
import { Footprints, Target, Info } from 'lucide-react';
import {
    ChartContainer,
    ChartTooltipContent,
  } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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

export function ActivityTracker() {
  return (
    <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
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
    </div>
  );
}