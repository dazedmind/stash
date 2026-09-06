"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BsArrowUpRight,
  BsBoxArrowRight,
  BsChevronRight,
  BsMoon,
  BsSun,
  BsGear,
  BsWallet2,
  BsExclamationTriangle,
  BsTrash,
  BsCalendarCheck,
} from "react-icons/bs";
import { AuthModal } from "../../components/AuthModal";
import { StashSelectCard } from "../../components/StashSelectCard";
import { formatCurrency } from "../../lib/finance";
import { useApp } from "../../lib/store";
import { parseCutoffs } from "../../lib/cutoff";

function getCurvePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 3;
    const cp1y = p0.y;
    const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
    const cp2y = p1.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

interface TransactionLog {
  id: string;
  type: "income" | "expense" | "transfer_internal" | "transfer_sub";
  amount: number;
  source: string | null;
  description: string | null;
  subCategoryName: string | null;
  createdAt: string;
}

interface PayLaterItem {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
  completed: boolean;
}

export default function MePage() {
  const {
    user,
    isAuthenticated,
    logout,
    totalBalance,
    totalDigital,
    totalCash,
    categories,
    allSubcategories,
    refreshData,
    salaryCutoffs,
    updateSalaryCutoffs,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [payLaters, setPayLaters] = useState<PayLaterItem[]>([]);
  const [overflowSubId, setOverflowSubId] = useState<string>("");

  // Salary Cutoff Settings
  const [cutoffPreset, setCutoffPreset] = useState<string>(() => {
    const key = salaryCutoffs.join(",");
    if (key === "5,20" || key === "10,25" || key === "15,31") return key;
    return "custom";
  });
  const [customCutoffText, setCustomCutoffText] = useState(() => salaryCutoffs.join(", "));
  const [cutoffSaved, setCutoffSaved] = useState(false);

  useEffect(() => {
    const key = salaryCutoffs.join(",");
    if (key === "5,20" || key === "10,25" || key === "15,31") {
      setCutoffPreset(key);
    } else {
      setCutoffPreset("custom");
    }
    setCustomCutoffText(salaryCutoffs.join(", "));
  }, [salaryCutoffs]);

  function handlePresetChange(val: string) {
    setCutoffPreset(val);
    if (val !== "custom") {
      const days = val.split(",").map(Number);
      updateSalaryCutoffs(days);
      setCutoffSaved(true);
      setTimeout(() => setCutoffSaved(false), 2000);
    }
  }

  function handleSaveCustomCutoff() {
    const parsed = parseCutoffs(customCutoffText);
    updateSalaryCutoffs(parsed);
    setCutoffSaved(true);
    setTimeout(() => setCutoffSaved(false), 2000);
  }

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [spendingPeriod, setSpendingPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [txRes, plRes] = await Promise.all([
          fetch("/api/finance/transactions?limit=500"),
          fetch("/api/pay-later"),
        ]);
        const txData = await txRes.json();
        const plData = await plRes.json();

        if (txData.transactions) setTransactions(txData.transactions);
        if (plData.payLaters) setPayLaters(plData.payLaters);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }
    loadDashboardData();

    const firstSub = allSubcategories[0]?.id || "";
    const savedOverflow = localStorage.getItem("global_overflow_sub_id") || firstSub;
    setOverflowSubId(savedOverflow);
  }, [allSubcategories]);

  useEffect(() => {
    if (showDeleteModal) {
      setDeleteConfirmText("");
      setTimeout(() => deleteInputRef.current?.focus(), 300);
    }
  }, [showDeleteModal]);

  function handleSaveOverflowSetting(subId: string) {
    setOverflowSubId(subId);
    localStorage.setItem("global_overflow_sub_id", subId);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE" || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE" });
      if (res.ok) await logout();
    } catch (err) {
      console.error("Delete account error:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  // Compute Current Month Metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxs = transactions.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentDayTxs = currentMonthTxs.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getDate() === now.getDate() && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const dailySpent = currentDayTxs
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const categorySpendMap: Record<string, number> = {};
  for (const tx of currentMonthTxs) {
    if (tx.type === "expense") {
      const name = tx.subCategoryName || "General Expense";
      categorySpendMap[name] = (categorySpendMap[name] || 0) + tx.amount;
    }
  }

  // Grouped datasets for Spending Dashboard
  const expenseTransactions = transactions.filter((tx) => tx.type === "expense");

  // 1. Daily (last 7 days including today)
  const dailyData: { date: Date; label: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyData.push({
      date: d,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      amount: 0,
    });
  }
  dailyData.forEach((item) => {
    const targetY = item.date.getFullYear();
    const targetM = item.date.getMonth();
    const targetD = item.date.getDate();
    const dayExpenses = expenseTransactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return (
        txDate.getFullYear() === targetY &&
        txDate.getMonth() === targetM &&
        txDate.getDate() === targetD
      );
    });
    item.amount = dayExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  });

  // 2. Weekly (last 4 weeks)
  const weeklyData: { start: Date; end: Date; label: string; amount: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - (i * 7 + 6));
    const end = new Date();
    end.setDate(end.getDate() - i * 7);

    const labelStart = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const labelEnd = end.toLocaleDateString("en-US", {
      month: start.getMonth() === end.getMonth() ? undefined : "short",
      day: "numeric",
    });

    weeklyData.push({
      start,
      end,
      label: `${labelStart}–${labelEnd}`,
      amount: 0,
    });
  }
  weeklyData.forEach((item) => {
    const startCopy = new Date(item.start);
    startCopy.setHours(0, 0, 0, 0);
    const endCopy = new Date(item.end);
    endCopy.setHours(23, 59, 59, 999);

    const weekExpenses = expenseTransactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= startCopy && txDate <= endCopy;
    });
    item.amount = weekExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  });

  // 3. Monthly (last 6 months including current month)
  const monthlyData: { year: number; month: number; label: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyData.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("en-US", { month: "short" }),
      amount: 0,
    });
  }
  monthlyData.forEach((item) => {
    const monthExpenses = expenseTransactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate.getFullYear() === item.year && txDate.getMonth() === item.month;
    });
    item.amount = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  });

  // Determine current active dataset
  const activeData =
    spendingPeriod === "daily"
      ? dailyData
      : spendingPeriod === "weekly"
        ? weeklyData
        : monthlyData;

  const maxVal = Math.max(...activeData.map((d) => d.amount), 0) || 1000;

  // Chart configuration
  const chartWidth = 400;
  const chartHeight = 140;
  const paddingX = 25;
  const paddingY = 20;
  const stepX = (chartWidth - 2 * paddingX) / (activeData.length - 1);

  const points = activeData.map((d, i) => {
    const x = paddingX + i * stepX;
    const y =
      chartHeight -
      paddingY -
      (d.amount / maxVal) * (chartHeight - 2 * paddingY);
    return { x, y, label: d.label, amount: d.amount };
  });

  // Generate SVG path for line and area fill
  const linePath = points.length > 0 ? getCurvePath(points) : "";
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : "";

  const activeIdx = selectedPointIndex !== null ? selectedPointIndex : points.length - 1;
  const activePoint = points[activeIdx] || { amount: 0, label: "" };

  // Dedicated card details based on selected/active point
  let cardAmount = activePoint.amount;
  let cardLabel = "";
  let cardSubtext = "";

  if (spendingPeriod === "daily") {
    cardLabel = "Daily Spent";
    const isToday = activeIdx === points.length - 1;
    const dateObj = dailyData[activeIdx]?.date;
    cardSubtext = isToday
      ? "Today"
      : dateObj
        ? dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "";
  } else if (spendingPeriod === "weekly") {
    cardLabel = "Weekly Spent";
    const isThisWeek = activeIdx === points.length - 1;
    cardSubtext = isThisWeek ? `This Week (${activePoint.label})` : activePoint.label;
  } else {
    cardLabel = "Monthly Spent";
    const isThisMonth = activeIdx === points.length - 1;
    const yearVal = monthlyData[activeIdx]?.year;
    cardSubtext = isThisMonth ? `This Month (${activePoint.label})` : `${activePoint.label} ${yearVal}`;
  }

  function handleToggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  }
  // ── Authenticated: Account overview (original layout) ──────────────────────
  return (
    <>
      <div className="animate-fade-in max-w-2xl mx-auto space-y-4 px-4 py-4 pb-20">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              ACCOUNT & INSIGHTS
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Overview</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white active:scale-95"
          >
            <BsBoxArrowRight className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </header>

        {/* Profile Banner — tappable, navigates to settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3.5 rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40 hover:bg-zinc-900 transition-colors"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-bold text-zinc-950 text-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-base text-zinc-100">
                {user?.name || "My Account"}
              </p>
              <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                Synced
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400 truncate">{user?.email}</p>
          </div>
          <BsChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
        </Link>

        {/* KPI Grid */}
        <section className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium">Daily Spent</span>
              <BsArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-zinc-100">
              {formatCurrency(dailySpent)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-medium">This day</p>
          </div>

          <div className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium">Total Balance</span>
              <BsWallet2 className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-zinc-100">
              {formatCurrency(totalBalance)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-medium">All stashes</p>
          </div>
        </section>


        {/* Pay Later Summary */}
        {/* {activePayLaters > 0 && (
          <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BsCreditCard className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Pay Later Commitments</h2>
              </div>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                {activePayLaters} Active
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Monthly Installments:</span>
              <span className="font-bold tabular-nums text-zinc-100">
                {formatCurrency(totalMonthlyPayLater)}
              </span>
            </div>
          </section>
        )} */}

        {/* Spending Dashboard Section */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Spending Dashboard
            </span>
            <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800/50">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSpendingPeriod(p);
                    setSelectedPointIndex(null);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md capitalize transition-colors ${
                    spendingPeriod === p
                      ? "bg-emerald-500 text-zinc-950 font-black"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Dedicated Card for amount spent */}
          <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {cardLabel}
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-zinc-100">
                {formatCurrency(cardAmount)}
              </p>
            </div>
            {cardSubtext && (
              <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-semibold text-zinc-300 border border-zinc-800/40">
                {cardSubtext}
              </span>
            )}
          </div>

          {/* Curve Line Gradient Chart */}
          <div className="relative w-full h-[140px] mt-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-emerald-500)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-emerald-500)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="rgba(63, 63, 70, 0.3)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="rgba(63, 63, 70, 0.3)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Gradient Area Fill */}
              {points.length > 0 && (
                <path d={areaPath} fill="url(#chartGradient)" />
              )}

              {/* Curve Line */}
              {points.length > 0 && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--color-emerald-500)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Dots */}
              {points.map((pt, i) => {
                const isActive = i === activeIdx;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setSelectedPointIndex(i)}>
                    <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? 5 : 3}
                      fill={isActive ? "var(--color-emerald-500)" : "rgb(63, 63, 70)"}
                      stroke={isActive ? "rgba(255, 255, 100, 0.4)" : "none"}
                      strokeWidth={isActive ? 4 : 0}
                      className="transition-all duration-200"
                    />
                    <text
                      x={pt.x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="bold"
                      fill={isActive ? "var(--color-emerald-500)" : "rgb(113, 113, 122)"}
                      className="transition-colors duration-200 pointer-events-none uppercase"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Allocation & Overflow Settings */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40 space-y-3">
          <div className="flex items-center gap-2">
            <BsGear className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Allocation & Overflow Settings</h2>
          </div>
          <div className="space-y-2 pt-1">
            <div className="pt-1">
              <StashSelectCard
                label="Default Overflow Target Stash"
                selectedSubId={overflowSubId}
                categories={categories}
                onSelect={(subId) => handleSaveOverflowSetting(subId)}
              />
            </div>
          </div>
        </section>

        {/* Salary Cutoff Dates */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BsCalendarCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Salary Cutoff Dates</h2>
            </div>
            {cutoffSaved && (
              <span className="text-[10px] font-bold text-emerald-400">Saved ✓</span>
            )}
          </div>
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs text-zinc-400 font-medium">Cutoff Schedule</label>
              <select
                value={cutoffPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl bg-zinc-900 px-3 text-xs font-medium text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="5,20">5th & 20th of the month</option>
                <option value="10,25">10th & 25th of the month</option>
                <option value="15,31">15th & End of month</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {cutoffPreset === "custom" && (
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs text-zinc-400 font-medium">Cutoff Days (comma-separated, 1–31)</span>
                  <input
                    type="text"
                    value={customCutoffText}
                    onChange={(e) => setCustomCutoffText(e.target.value)}
                    placeholder="e.g. 5, 20"
                    className="mt-1.5 min-h-[44px] w-full rounded-xl bg-zinc-900 px-3 text-xs font-medium text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSaveCustomCutoff}
                  className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95"
                >
                  Save Cutoffs
                </button>
              </div>
            )}
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

      {/* Delete Account Modal */}
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
                This will permanently delete your account and all your stash data. This action{" "}
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

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
