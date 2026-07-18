// components/bottom-nav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, History, User } from "lucide-react";

const links = [
  { href: "/", label: "Today", icon: Home },
  { href: "/log", label: "Log", icon: Camera },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 border-t bg-background">
      <div className="flex justify-around py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}