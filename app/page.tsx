export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-scale-in text-center">
        <div className="mb-2 text-5xl font-bold tracking-tight text-[var(--foreground)]">
          Harbor Eval
        </div>
        <p className="text-lg text-[var(--text-secondary)]">
          Design evals that find where models fail.
        </p>
      </div>
    </div>
  );
}
