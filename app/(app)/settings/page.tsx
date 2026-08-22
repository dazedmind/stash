"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BsArrowLeft,
  BsBoxArrowRight,
  BsCheck2,
  BsExclamationTriangle,
  BsEye,
  BsEyeSlash,
  BsLock,
  BsMoon,
  BsPerson,
  BsSun,
  BsTrash,
} from "react-icons/bs";
import { StashSelectCard } from "../../components/StashSelectCard";
import { useApp } from "../../lib/store";

export default function SettingsPage() {
  const { user, logout, categories, allSubcategories, refreshData } = useApp();

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Appearance
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Overflow
  const [overflowSubId, setOverflowSubId] = useState("");

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    const firstSub = allSubcategories[0]?.id || "";
    setOverflowSubId(localStorage.getItem("global_overflow_sub_id") || firstSub);
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(saved);
  }, [user, allSubcategories]);

  useEffect(() => {
    if (showDeleteModal) {
      setDeleteConfirmText("");
      setTimeout(() => deleteInputRef.current?.focus(), 300);
    }
  }, [showDeleteModal]);

  async function handleUpdateProfile() {
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: "ok", text: "Profile updated successfully." });
        refreshData();
      } else {
        setProfileMsg({ type: "err", text: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileMsg({ type: "err", text: "Something went wrong." });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (isSavingPassword) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: "err", text: "All fields are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "err", text: "Password must be at least 6 characters." });
      return;
    }
    setIsSavingPassword(true);
    setPasswordMsg(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: "ok", text: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "err", text: data.error || "Failed to change password." });
      }
    } catch {
      setPasswordMsg({ type: "err", text: "Something went wrong." });
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleToggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  }

  function handleSaveOverflow(subId: string) {
    setOverflowSubId(subId);
    localStorage.setItem("global_overflow_sub_id", subId);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE" || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE" });
      if (res.ok) await logout();
    } catch {
      // silent
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <>
      <div className="animate-fade-in max-w-2xl mx-auto space-y-4 px-4 py-4 pb-24">
        {/* Header */}
        <header className="flex items-center gap-3 mb-2">
          <Link
            href="/me"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <BsArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Account</p>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 leading-none">Settings</h1>
          </div>
        </header>

        {/* ── Profile Section ── */}
        <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/30">
            <div className="flex items-center gap-2">
              <BsPerson className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Profile</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-400 ml-1">Display Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400 ml-1">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>

            {profileMsg && (
              <p className={`text-xs font-medium ${profileMsg.type === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
                {profileMsg.text}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpdateProfile}
              disabled={isSavingProfile}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50"
            >
              <BsCheck2 className="h-4 w-4" />
              {isSavingProfile ? "Saving…" : "Update Profile"}
            </button>
          </div>
        </section>

        {/* ── Change Password Section ── */}
        <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/30">
            <div className="flex items-center gap-2">
              <BsLock className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Change Password</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-400 ml-1">Current Password</span>
              <div className="relative mt-1">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-zinc-900 px-4 py-3 pr-11 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showCurrentPw ? <BsEyeSlash className="h-4 w-4" /> : <BsEye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400 ml-1">New Password</span>
              <div className="relative mt-1">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-zinc-900 px-4 py-3 pr-11 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showNewPw ? <BsEyeSlash className="h-4 w-4" /> : <BsEye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400 ml-1">Confirm New Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>

            {passwordMsg && (
              <p className={`text-xs font-medium ${passwordMsg.type === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
                {passwordMsg.text}
              </p>
            )}

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={isSavingPassword}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 text-sm font-bold text-zinc-100 transition-all hover:bg-zinc-700 active:scale-[0.99] disabled:opacity-50"
            >
              <BsLock className="h-4 w-4" />
              {isSavingPassword ? "Saving…" : "Change Password"}
            </button>
          </div>
        </section>

        {/* ── Appearance Section ── */}
        <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Appearance</p>
          </div>
          <button
            type="button"
            onClick={handleToggleTheme}
            className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-zinc-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <BsMoon className="h-4 w-4 text-zinc-400" />
              ) : (
                <BsSun className="h-4 w-4 text-zinc-400" />
              )}
              <span className="text-sm font-medium text-zinc-200">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${theme === "dark" ? "bg-emerald-500" : "bg-zinc-700"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-4.5" : "translate-x-1"}`} />
            </div>
          </button>
        </section>

        {/* ── Allocation Section ── */}
        <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Allocation</p>
          </div>
          <div className="px-4 py-4">
            <StashSelectCard
              dropUp
              label="Default Overflow Target Stash"
              selectedSubId={overflowSubId}
              categories={categories}
              onSelect={handleSaveOverflow}
            />
          </div>
        </section>

        {/* ── Danger Zone ── */}
        <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/70">Danger Zone</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-between px-4 py-3.5 border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BsBoxArrowRight className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-200">Sign Out</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-rose-500/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BsTrash className="h-4 w-4 text-rose-400" />
              <span className="text-sm font-medium text-rose-400">Delete Account</span>
            </div>
          </button>
        </section>
      </div>

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-black/80" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-zinc-950 p-6 shadow-2xl border border-zinc-800/60">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
                <BsExclamationTriangle className="h-7 w-7 text-rose-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Delete Account</h2>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                This will permanently delete your account and all stash data. This action{" "}
                <strong className="text-zinc-200">cannot be undone</strong>.
              </p>
            </div>
            <label className="block mb-4">
              <span className="text-xs font-medium text-zinc-400">
                Type <strong className="text-zinc-200">DELETE</strong> to confirm
              </span>
              <input
                ref={deleteInputRef}
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-100 outline-none focus:ring-1 focus:ring-rose-500 tracking-widest"
              />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
