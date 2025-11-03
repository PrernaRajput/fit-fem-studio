import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GeneratePersonalizedWorkoutPlanOutput } from '@/ai/flows/personalized-workout-plan';
import { CalendarCheck, Info, Utensils, CheckCircle } from 'lucide-react';
import React from 'react';

type PersonalizedWorkoutPlanProps = {
  data: GeneratePersonalizedWorkoutPlanOutput;
};

const iconMap: { [key: string]: React.ReactNode } = {
  Monday: <CalendarCheck className="h-5 w-5 text-primary" />,
  Tuesday: <CalendarCheck className="h-5 w-5 text-primary" />,
  Wednesday: <CalendarCheck className="h-5 w-5 text-primary" />,
  Thursday: <CalendarCheck className="h-5 w-5 text-primary" />,
  Friday: <CalendarCheck className="h-5 w-5 text-primary" />,
  Saturday: <CalendarCheck className="h-5 w-5 text-primary" />,
  Sunday: <CalendarCheck className="h-5 w-5 text-primary" />,
  Justification: <Info className="h-5 w-5 text-accent" />,
  'Dietary Guidelines': <Utensils className="h-5 w-5 text-accent" />,
};

function parseWorkoutPlan(plan: string) {
  const dayOrder = ['Justification', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Dietary Guidelines'];
  const planByDay: { [key: string]: string } = {};

  const regex = new RegExp(`(${dayOrder.join('|')}):`, 'g');
  const parts = plan.split(regex);

  let currentDay: string | null = null;
  for (let i = 1; i < parts.length; i += 2) {
    const day = parts[i];
    const content = parts[i + 1]?.trim() || '';
    if (dayOrder.includes(day)) {
      planByDay[day] = content;
    }
  }

  // Handle case where first part is intro/justification without a keyword
  if (!Object.keys(planByDay).length && plan) {
    const introKey = "Introduction";
    dayOrder.unshift(introKey);
    planByDay[introKey] = plan;
  }
  
  return { planByDay, dayOrder };
}


export function PersonalizedWorkoutPlan({ data }: PersonalizedWorkoutPlanProps) {
  if (!data?.weeklyWorkoutPlan) {
    return null;
  }
  
  const { planByDay, dayOrder } = parseWorkoutPlan(data.weeklyWorkoutPlan);

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl font-bold">
          <CheckCircle className="h-8 w-8 text-primary" />
          Your Custom Workout Plan
        </CardTitle>
        <CardDescription>
          Here is your AI-generated weekly plan. Expand each section to see the details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="Monday">
          {dayOrder.map((day) => {
            const content = planByDay[day];
            if (!content) return null;

            return (
              <AccordionItem value={day} key={day}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-3">
                    {iconMap[day] || <CalendarCheck className="h-5 w-5 text-primary" />}
                    {day}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap pl-2 border-l-2 border-accent ml-2 py-2">
                    {content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
