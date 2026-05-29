import { Button } from '@/components/Button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-xl">
        <h1 className="text-brand-deep text-4xl font-bold sm:text-5xl">404 — Page not found</h1>
        <p className="text-text-soft mt-3 text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button href="/" className="mt-8">
          Back home
        </Button>
      </div>
    </main>
  );
}
