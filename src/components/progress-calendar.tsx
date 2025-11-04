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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';

type DailyStats = {
  date: string; // yyyy-MM-dd
  caloriesConsumed?: number;
  caloriesBurned?: number;
  waterIntake?: number;
  workoutsDone?: number;
};

export function ProgressCalendar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const dailyStatsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'calorieBudgets');
  }, [user, firestore]);

  const { data: dailyStatsData, isLoading } = useCollection<DailyStats>(dailyStatsCollectionRef);

  const dailyStatsMap = useMemo(() => {
    if (!dailyStatsData) return new Map<string, WithId<DailyStats>>();
    return new Map(
      dailyStatsData
        .filter(stat => stat && stat.date) // Filter out items with no date
        .map(stat => [stat.date, stat])
    );
  }, [dailyStatsData]);

  const selectedDayStats: DailyStats | null = date
    ? dailyStatsMap.get(format(date, 'yyyy-MM-dd')) || null
    : null;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const daysWithData = useMemo(() => {
    return Array.from(dailyStatsMap.keys())
      .filter(dateStr => !!dateStr) // Ensure no undefined keys are processed
      .map(dateStr => new Date(dateStr.replace(/-/g, '/')));
  }, [dailyStatsMap]);


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
                  <span className="font-bold">{selectedDayStats.caloriesConsumed || 0} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-accent" />
                    <span>Calories Burned</span>
                  </div>
                  <span className="font-bold">{selectedDayStats.caloriesBurned || 0} kcal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <span>Water Intake</span>
                  </div>
                  <span className="font-bold">{selectedDayStats.waterIntake || 0} glasses</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <span>Workouts</span>
                  </div>
                  <span className="font-bold">{selectedDayStats.workoutsDone || 0}</span>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-center h-full text-muted-foreground bg-muted/30 rounded-lg p-8"
                style={{ height: '300px' }}
              >
                <p>{isLoading ? 'Loading stats...' : 'No data for this day.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
