"use client";

import { useState } from "react";
import { BsCheckLg, BsEnvelope, BsLock, BsPerson, BsPlusLg } from "react-icons/bs";
import { useApp } from "../lib/store";

interface AuthModalProps {
  open: boolean;
  onClose?: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const err = await login(email, password);
        if (err) {
          setError(err);
        } else if (onClose) {
          onClose();
        }
      } else {
        const err = await register(email, password, name);
        if (err) {
          setError(err);
        } else if (onClose) {
          onClose();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            S
          </div>
          <h2 className="mt-3 text-xl font-bold text-zinc-100">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            {mode === "login"
              ? "Sign in to access your stashes & budget"
              : "Register to manage your stashes with Neon DB"}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === "register" && (
            <div>
              <span className="text-xs font-medium text-zinc-400">Name</span>
              <div className="relative mt-1">
                <BsPerson className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-3 text-xs text-zinc-100 outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-medium text-zinc-400">Email</span>
            <div className="relative mt-1">
              <BsEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-3 text-xs text-zinc-100 outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-zinc-400">Password</span>
            <div className="relative mt-1">
              <BsLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-3 text-xs text-zinc-100 outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-40"
          >
            {loading ? (
              "Processing..."
            ) : mode === "login" ? (
              <>
                <BsCheckLg className="h-4 w-4" /> Sign In
              </>
            ) : (
              <>
                <BsPlusLg className="h-4 w-4" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center border-t border-zinc-800/60 pt-4 text-xs text-zinc-400">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("register");
                }}
                className="font-semibold text-emerald-400 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("login");
                }}
                className="font-semibold text-emerald-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
