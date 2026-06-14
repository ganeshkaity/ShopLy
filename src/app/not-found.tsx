import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center p-4">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl mb-8">Sorry, the page you are looking for does not exist.</p>
        <Link href="/" className="text-primary underline hover:text-primary/80 transition-colors">
          Return to Home
        </Link>
      </div>
    </section>
  );
}
