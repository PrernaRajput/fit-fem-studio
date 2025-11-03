'use client';

import { ProgressCalendar } from '@/components/progress-calendar';
import { Footer } from '@/components/footer';

export default function ProgressPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 py-8">
        <ProgressCalendar />
      </main>
      <Footer />
    </div>
  );
}
