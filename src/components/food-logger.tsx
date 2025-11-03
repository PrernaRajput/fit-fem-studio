'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PlusCircle,
  BookOpen,
  Droplets,
  ScanLine,
  Flame,
  Apple,
  Salad,
  Drumstick,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const foodCategories = [
  { name: 'Breakfast', icon: <Apple className="h-5 w-5" /> },
  { name: 'Lunch', icon: <Salad className="h-5 w-5" /> },
  { name: 'Dinner', icon: <Drumstick className="h-5 w-5" /> },
  { name: 'Snacks', icon: <BookOpen className="h-5 w-5" /> },
];

export function FoodLogger() {
  const [calories, setCalories] = useState({
    consumed: 1200,
    budget: 2000,
    burned: 300,
  });

  const remaining = calories.budget - calories.consumed + calories.burned;
  const consumedPercentage = (calories.consumed / calories.budget) * 100;

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-2xl mx-auto overflow-hidden shadow-2xl rounded-2xl border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Daily Nutrition
          </CardTitle>
          <CardDescription>
            Log your meals and track your progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Calorie Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Consumed</p>
              <p className="text-2xl font-bold">{calories.consumed}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-2xl font-bold">{calories.budget}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Burned</p>
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-accent" />
                {calories.burned}
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div
                    className="h-full w-full flex-1 bg-primary transition-all"
                    style={{ width: `${consumedPercentage}%` }}
                />
            </div>
            <div className="mt-2 text-center text-sm font-medium text-primary">
              {Math.max(0, remaining)} Calories Remaining
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Log Food
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Food</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label htmlFor="food-search">Search for food</Label>
                    <Input id="food-search" placeholder="e.g., Apple, 1 slice" />
                    <Button className="w-full">Search</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full">
              <ScanLine className="mr-2 h-4 w-4" /> Scan Barcode
            </Button>
          </div>

          {/* Meal Categories */}
          <div className="space-y-4">
            {foodCategories.map((category) => (
              <Card key={category.name} className="bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <CardTitle className="text-lg font-semibold">
                      {category.name}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon">
                    <PlusCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    No items logged yet.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Water Intake */}
          <Card className="bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Droplets className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-lg font-semibold">
                  Water Intake
                </CardTitle>
              </div>
              <p className="font-bold">4 / 8 glasses</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                        className="h-full w-full flex-1 bg-blue-400 transition-all"
                        style={{ width: `50%` }}
                    />
                </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
