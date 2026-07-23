"use client";

import * as React from "react";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  className = "",
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-emerald-500" : "bg-zinc-800"
      } ${className}`}
      {...props}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full transition-transform ${
          checked ? "translate-x-4 bg-zinc-950 shadow-md" : "translate-x-0 bg-zinc-400"
        }`}
      />
    </button>
  );
}
