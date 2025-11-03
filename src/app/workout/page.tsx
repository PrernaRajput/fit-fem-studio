import { WorkoutRoutine } from '@/components/workout-routine';
import { Footer } from '@/components/footer';

export default function WorkoutPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 py-8">
        <WorkoutRoutine />
      </main>
      <Footer />
    </div>
  );
}
