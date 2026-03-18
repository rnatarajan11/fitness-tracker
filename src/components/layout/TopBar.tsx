"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB_TITLES: Record<string, string> = {
  "/food": "Food",
  "/weight": "Weight",
  "/workout": "Workout",
  "/walks": "Walks",
  "/profile": "Profile",
};

export default function TopBar() {
  const pathname = usePathname();
  const title = TAB_TITLES[pathname] ?? "FitTrack";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
      style={{
        height: "var(--top-bar-height)",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </span>

      <Link
        href="/profile"
        aria-label="Profile"
        className="flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-opacity hover:opacity-80 active:opacity-60"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        RN
      </Link>
    </header>
  );
}
