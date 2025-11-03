import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="bg-card/50 border-t backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <p className="font-semibold text-card-foreground">FitFemAI</p>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FitFemAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
