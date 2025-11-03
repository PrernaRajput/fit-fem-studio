import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <section className="relative w-full h-[400px] md:h-[500px] text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full mb-4">
            <Logo className="h-16 w-16" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-shadow-lg">
          Welcome to FitFemAI
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200 text-shadow">
          Your personalized AI companion for fitness, strength, and well-being.
        </p>
        <Link href="/workout" className="mt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6">
                Start Workout
            </Button>
        </Link>
      </div>
    </section>
  );
}
