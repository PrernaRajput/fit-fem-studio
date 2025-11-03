import { Hero } from '@/components/hero';
import { WorkoutGenerator } from '@/components/workout-generator';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <Hero />
        <WorkoutGenerator />
      </main>
      <Footer />
    </div>
  );
}
