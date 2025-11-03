'use client';

import { ActivityTracker } from '@/components/activity-tracker';
import { Footer } from '@/components/footer';

export default function ActivityPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 py-8">
        <ActivityTracker />
      </main>
      <Footer />
    </div>
  );
}
