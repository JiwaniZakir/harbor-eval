import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--bg)] p-8 text-center font-sans">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground-5)]">
        <span className="text-3xl">◇</span>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          The page you are looking for does not exist.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--foreground-5)]"
      >
        Go home
      </Link>
    </div>
  );
}
