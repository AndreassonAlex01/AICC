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
    <nav className="fixed bottom-0 left-1/2 z-10 w-full max-w-md -translate-x-1/2 border-t bg-background/90 backdrop-blur">
      <div className="flex justify-around py-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}