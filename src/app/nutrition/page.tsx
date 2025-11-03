'use client';

import { FoodLogger } from '@/components/food-logger';
import { Footer } from '@/components/footer';

export default function NutritionPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 py-8">
        <FoodLogger />
      </main>
      <Footer />
    </div>
  );
}
