'use client';

import { useState } from 'react';
import { getFoodAnalysis } from '@/app/actions';
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
  Plus,
  Minus,
  ChevronDown,
  X,
  Loader2,
  Settings,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { recommendCalories, RecommendCaloriesInput } from '@/ai/ai-calorie-budget-recommendation';
import { AnalyzeFoodOutput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


type FoodItem = {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};
  
type MealLog = {
    Breakfast: FoodItem[];
    Lunch: FoodItem[];
    Dinner: FoodItem[];
    Snacks: FoodItem[];
};

const foodCategories = [
    { name: 'Breakfast', icon: <Apple className="h-5 w-5" />, key: 'Breakfast' as keyof MealLog },
    { name: 'Lunch', icon: <Salad className="h-5 w-5" />, key: 'Lunch' as keyof MealLog },
    { name: 'Dinner', icon: <Drumstick className="h-5 w-5" />, key: 'Dinner' as keyof MealLog },
    { name: 'Snacks', icon: <BookOpen className="h-5 w-5" />, key: 'Snacks' as keyof MealLog },
];

export function FoodLogger() {
    const { toast } = useToast();
    const [mealLog, setMealLog] = useState<MealLog>({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
    const [calories, setCalories] = useState({
        consumed: 1200,
        budget: 2000,
        burned: 300,
    });
    const [water, setWater] = useState({ consumed: 4, goal: 8 });
    const [tempWaterGoal, setTempWaterGoal] = useState(8);
    const [userProfile, setUserProfile] = useState<RecommendCaloriesInput>({
        goal: 'weight loss',
        dailyCaloriesBurned: 300,
        dailyCaloriesIntake: 1200,
        weightInKilograms: 70,
        heightInCentimeters: 170,
        ageInYears: 30,
        gender: 'female',
        activityLevel: 'lightly active',
    });
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    
    // State for food logging dialog
    const [isFoodLogOpen, setIsFoodLogOpen] = useState(false);
    const [foodQuery, setFoodQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<AnalyzeFoodOutput | null>(null);
    const [activeCategory, setActiveCategory] = useState<keyof MealLog | null>(null);

    const consumedCalories = Object.values(mealLog).flat().reduce((acc, item) => acc + item.calories, 0);
    const remaining = calories.budget - consumedCalories + calories.burned;
    const consumedPercentage = (consumedCalories / calories.budget) * 100;
    const waterPercentage = (water.consumed / water.goal) * 100;

    const handleWaterChange = (amount: number) => {
        setWater(prev => ({ ...prev, consumed: Math.max(0, prev.consumed + amount) }));
    };

    const handleProfileChange = (key: keyof RecommendCaloriesInput, value: any) => {
        setUserProfile(prev => ({...prev, [key]: value}));
    }

    const handleGoalUpdate = async () => {
        const result = await recommendCalories(userProfile);
        setCalories(prev => ({ ...prev, budget: result.recommendedDailyCalorieIntake }));
        setIsGoalDialogOpen(false);
    }
    
    const saveWaterGoal = () => {
        setWater(prev => ({ ...prev, goal: tempWaterGoal }));
    };

    const openFoodLogDialog = (category: keyof MealLog) => {
        setActiveCategory(category);
        setSearchResult(null);
        setFoodQuery('');
        setIsFoodLogOpen(true);
    };

    const handleFoodSearch = async () => {
        if (!foodQuery.trim()) return;
        setIsSearching(true);
        setSearchResult(null);

        const result = await getFoodAnalysis({ query: foodQuery });

        if (result.success && result.data) {
            setSearchResult(result.data);
        } else {
            toast({
                variant: 'destructive',
                title: 'Search Failed',
                description: result.error || 'Could not analyze the food item.',
            });
        }
        setIsSearching(false);
    };
    
    const addFoodItemToLog = () => {
        if (searchResult && activeCategory) {
            const newFoodItem: FoodItem = {
                name: searchResult.foodName,
                calories: searchResult.calories,
                protein: searchResult.protein,
                carbs: searchResult.carbohydrates,
                fat: searchResult.fat,
            };
            setMealLog(prev => ({
                ...prev,
                [activeCategory]: [...prev[activeCategory], newFoodItem],
            }));
            setIsFoodLogOpen(false);
        }
    };

    const removeFoodItem = (category: keyof MealLog, index: number) => {
        setMealLog(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index),
        }));
    };

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
          {/* Goal Selector */}
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
                <div className="p-3 bg-muted/50 rounded-lg text-center cursor-pointer hover:bg-muted/80 transition-colors">
                    <p className="text-sm font-medium text-muted-foreground">Your Goal</p>
                    <p className="text-lg font-semibold text-primary capitalize flex items-center justify-center gap-1">
                        {userProfile.goal} <ChevronDown className="h-4 w-4" />
                    </p>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Your Goal & Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div className='space-y-2'>
                        <Label>Primary Goal</Label>
                        <Select value={userProfile.goal} onValueChange={(v: "weight loss" | "maintain" | "gain") => handleProfileChange('goal', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your goal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weight loss">Weight Loss</SelectItem>
                                <SelectItem value="maintain">Maintain Weight</SelectItem>
                                <SelectItem value="gain">Gain Weight</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input id="weight" type="number" value={userProfile.weightInKilograms} onChange={(e) => handleProfileChange('weightInKilograms', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input id="height" type="number" value={userProfile.heightInCentimeters} onChange={(e) => handleProfileChange('heightInCentimeters', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" type="number" value={userProfile.ageInYears} onChange={(e) => handleProfileChange('ageInYears', e.target.value === '' ? 0 : parseInt(e.target.value, 10))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select value={userProfile.gender} onValueChange={(v: "male" | "female") => handleProfileChange('gender', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <Label>Activity Level</Label>
                        <Select value={userProfile.activityLevel} onValueChange={(v) => handleProfileChange('activityLevel', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sedentary">Sedentary</SelectItem>
                                <SelectItem value="lightly active">Lightly Active</SelectItem>
                                <SelectItem value="moderately active">Moderately Active</SelectItem>
                                <SelectItem value="very active">Very Active</SelectItem>
                                <SelectItem value="extra active">Extra Active</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogClose asChild>
                    <Button onClick={handleGoalUpdate} className="w-full mt-4">Update Budget</Button>
                </DialogClose>
            </DialogContent>
          </Dialog>

          {/* Calorie Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Consumed</p>
              <p className="text-2xl font-bold">{consumedCalories}</p>
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

          <Dialog open={isFoodLogOpen} onOpenChange={setIsFoodLogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Food for {activeCategory}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label htmlFor="food-search">Search for food</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="food-search" 
                            placeholder="e.g., 1 large apple" 
                            value={foodQuery}
                            onChange={(e) => setFoodQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFoodSearch()}
                        />
                        <Button onClick={handleFoodSearch} disabled={isSearching}>
                            {isSearching ? <Loader2 className="animate-spin" /> : 'Search'}
                        </Button>
                    </div>

                    {isSearching && (
                        <div className="text-center p-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <p className="mt-2 text-muted-foreground">Analyzing...</p>
                        </div>
                    )}

                    {searchResult && (
                        <div className="space-y-4 pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className='capitalize'>{searchResult.foodName}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p><strong>Calories:</strong> {searchResult.calories} kcal</p>
                                    <p><strong>Protein:</strong> {searchResult.protein}g</p>
                                    <p><strong>Carbs:</strong> {searchResult.carbohydrates}g</p>
                                    <p><strong>Fat:</strong> {searchResult.fat}g</p>
                                </CardContent>
                            </Card>
                            <Button className="w-full" onClick={addFoodItemToLog}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add to {activeCategory}
                            </Button>
                        </div>
                    )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full">
              <ScanLine className="mr-2 h-4 w-4" /> Scan Barcode
            </Button>

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
                  <Button variant="ghost" size="icon" onClick={() => openFoodLogDialog(category.key)}>
                    <PlusCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    {mealLog[category.key].length > 0 ? (
                        <ul className="space-y-2">
                            {mealLog[category.key].map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-background">
                                    <div>
                                        <p className="font-semibold capitalize">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.calories} kcal</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeFoodItem(category.key, index)}>
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No items logged yet.
                        </p>
                    )}
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
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleWaterChange(-1)}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <p className="font-bold tabular-nums">{water.consumed} / {water.goal} glasses</p>
                    <Button variant="ghost" size="icon" onClick={() => handleWaterChange(1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>Set Water Goal</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="water-goal" className="text-right">
                                    Glasses
                                    </Label>
                                    <Input
                                    id="water-goal"
                                    type="number"
                                    value={tempWaterGoal}
                                    onChange={(e) => setTempWaterGoal(Number(e.target.value))}
                                    className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogClose asChild>
                                <Button onClick={saveWaterGoal}>Save changes</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                        className="h-full w-full flex-1 bg-blue-400 transition-all"
                        style={{ width: `${waterPercentage}%` }}
                    />
                </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
