'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Flame, Apple, Droplets, Dumbbell } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

type DailyStats = {
  caloriesConsumed: number;
  caloriesBurned: number;
  waterIntake: number;
  workoutsDone: number;
};

// Mock data for demonstration purposes
const mockData: { [key: string]: DailyStats } = {
  [format(new Date(), 'yyyy-MM-dd')]: {
    caloriesConsumed: 1200,
    caloriesBurned: 300,
    waterIntake: 8,
    workoutsDone: 1,
  },
  [format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')]: {
    caloriesConsumed: 1800,
    caloriesBurned: 500,
    waterIntake: 6,
    workoutsDone: 1,
  },
  [format(new Date(Date.now() - 2 * 86400000), 'yyyy-MM-dd')]: {
    caloriesConsumed: 1500,
    caloriesBurned: 250,
    waterIntake: 7,
    workoutsDone: 0,
  },
};

export function ProgressCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDayStats: DailyStats | null = date
    ? mockData[format(date, 'yyyy-MM-dd')] || null
    : null;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    // Only update if the selected date has changed
    if (selectedDate && (!date || !isSameDay(selectedDate, date))) {
        setDate(selectedDate);
    }
  };
  
  // Memoize the dates that have data to avoid recalculating on every render
  const daysWithData = useMemo(() => {
    return Object.keys(mockData).map(dateStr => new Date(dateStr.replace(/-/g, '/')));
  }, []);


  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-2xl mx-auto overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Your Progress
          </CardTitle>
          <CardDescription>
            Select a day to view your stats. Days with logged activity have a dot.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6 md:flex md:flex-row md:gap-8 md:space-y-0">
          <div className="flex-shrink-0 flex justify-center">
            <style>{`
              .day-with-dot {
                position: relative;
              }
              .day-with-dot::after {
                content: '';
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
                height: 6px;
                width: 6px;
                border-radius: 50%;
                background-color: hsl(var(--primary));
              }
            `}</style>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
              modifiers={{
                hasData: daysWithData,
              }}
              modifiersClassNames={{
                hasData: 'day-with-dot',
              }}
              disabled={(day) => day > new Date()}
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-semibold mb-4">
              Stats for {date ? format(date, 'MMMM d, yyyy') : '...'}
            </h3>
            {selectedDayStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Apple className="h-5 w-5 text-green-400" />
                    <span>Calories Consumed</span>
                  </div>
                  <span className="font-bold">{selectedDayStats.caloriesConsumed} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-accent" />
                    <span>Calories Burned</span>
                  </div>
                  <span className="font-bold">{selectedDayStats.caloriesBurned} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <span>Water Intake</span>
                  </div>
                  <span className="font-bold">{selectedDayStats.waterIntake} glasses</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <span>Workouts</span>
                  </div>
                  <span className="font-bold">{selectedDayStats.workoutsDone}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/30 rounded-lg p-8">
                <p>No data for this day.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
