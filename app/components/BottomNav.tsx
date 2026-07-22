"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BsHouseDoor,
  BsHouseDoorFill,
  BsPerson,
  BsPersonFill,
  BsPieChart,
  BsPieChartFill,
  BsPlusLg,
  BsWallet2,
} from "react-icons/bs";

interface BottomNavProps {
  onAddClick?: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1.5 pb-1">
        {/* Home */}
        <Link
          href="/"
          className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
            pathname === "/" ? "text-emerald-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {pathname === "/" ? <BsHouseDoorFill className="h-5 w-5" /> : <BsHouseDoor className="h-5 w-5" />}
          Home
        </Link>

        {/* Stashes */}
        <Link
          href="/stashes"
          className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
            pathname === "/stashes" ? "text-emerald-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <BsWallet2 className="h-5 w-5" />
          Stashes
        </Link>

        {/* Plus (+) Action Button - Light Blue primary accent */}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={onAddClick}
            aria-label="Add entry"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 font-bold transition-transform active:scale-90 hover:bg-emerald-300 shadow-md shadow-sky-500/10"
          >
            <BsPlusLg className="h-5 w-5" />
          </button>
        </div>

        {/* Plan */}
        <Link
          href="/plan"
          className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
            pathname === "/plan" ? "text-emerald-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {pathname === "/plan" ? <BsPieChartFill className="h-5 w-5" /> : <BsPieChart className="h-5 w-5" />}
          Plan
        </Link>

        {/* Me */}
        <Link
          href="/me"
          className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
            pathname === "/me" ? "text-emerald-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {pathname === "/me" ? <BsPersonFill className="h-5 w-5" /> : <BsPerson className="h-5 w-5" />}
          Me
        </Link>
      </div>
    </nav>
  );
}
