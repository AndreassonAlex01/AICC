// components/app-shell.tsx
"use client"; // required now — this file has an onClick, so it can't stay a server component
import { BottomNav } from "@/components/bottom-nav";

function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">🍽️</span>
          <h1 className="text-lg font-semibold tracking-tight">AICC</h1>
        </div>
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="flex size-9 items-center justify-center rounded-full text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          🌓
        </button>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}