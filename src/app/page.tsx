'use client';
import { Hero } from '@/components/hero';
import { WorkoutGenerator } from '@/components/workout-generator';
import { Footer } from '@/components/footer';
import { useUser } from '@/firebase';

export default function Home() {
  const { user, isLoading } = useUser();
  
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <Hero />
        { (user && !isLoading) && <WorkoutGenerator /> }
      </main>
      <Footer />
    </div>
  );
}
