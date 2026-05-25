import type { Metadata, Viewport } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Harbor Eval",
    template: "%s | Harbor Eval",
  },
  description: "Visual AI evaluation platform. Design evals that find where models fail.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Harbor Eval",
    description: "Visual AI evaluation platform. Design evals that find where models fail.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1f1ee",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] font-sans text-[var(--foreground)] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontFamily: "var(--font-sans)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
            },
          }}
        />
      </body>
    </html>
  );
}
