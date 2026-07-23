"use client";

import { useEffect, useState } from "react";
import { BsExclamationTriangle, BsTrash, BsX } from "react-icons/bs";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className={`absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-950 p-5 shadow-2xl transition-all duration-200 ease-out border border-zinc-800/80 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-100"
        >
          <BsX className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              isDanger
                ? "bg-rose-500/10 text-rose-400 font-bold"
                : "bg-amber-500/10 text-amber-400 font-bold"
            }`}
          >
            {isDanger ? (
              <BsTrash className="h-5 w-5" />
            ) : (
              <BsExclamationTriangle className="h-5 w-5" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100">{title}</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[38px] rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`min-h-[38px] rounded-xl px-4 text-xs font-bold transition-all active:scale-95 ${
              isDanger
                ? "bg-rose-500 text-zinc-950 hover:bg-rose-400"
                : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            } disabled:opacity-50`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
