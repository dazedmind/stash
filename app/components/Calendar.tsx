"use client";

import { useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import type { Subscription } from "../lib/finance";
import { CategoryIcon } from "./CategoryIcon";

interface CalendarProps {
  subscriptions: Subscription[];
}

export function Calendar({ subscriptions }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-14 md:h-20" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    // Check if any subscriptions fall on this date
    // For monthly, they fall on the same date every month.
    // For yearly, they fall on the same date and month.
    const subsOnThisDay = subscriptions.filter((sub) => {
      const subDate = new Date(sub.billingDate);
      if (sub.billingCycle === "monthly") {
        return subDate.getDate() === d;
      }
      if (sub.billingCycle === "yearly") {
        return subDate.getDate() === d && subDate.getMonth() === month;
      }
      return false;
    });

    days.push(
      <div
        key={`day-${d}`}
        className={`relative flex flex-col items-center justify-start rounded-xl p-1 transition-colors ${
          isToday ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-zinc-800/60"
        } h-12 md:h-14`}
      >
        <span
          className={`text-sm md:text-xs font-semibold ${
            isToday ? "text-emerald-400" : "text-zinc-400"
          }`}
        >
          {d}
        </span>
        <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
          {subsOnThisDay.slice(0, 3).map((sub) => (
            <div key={sub.id} className="text-emerald-400">
              <CategoryIcon iconName={sub.icon} className="h-3 w-3 md:h-2.5 md:w-2.5" />
            </div>
          ))}
          {subsOnThisDay.length > 3 && (
            <span className="text-[8px] text-zinc-500">+{subsOnThisDay.length - 3}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-zinc-950 p-4 md:p-6 shadow-xl border border-zinc-800/60">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-zinc-100">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <BsChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <BsChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days}
      </div>
    </div>
  );
}
