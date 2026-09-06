export interface CutoffPeriod {
  cutoffDay: number;
  label: string;
  shortLabel: string;
  periodLabel: string;
  cycleMonthLabel: string;
  key: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}

export const DEFAULT_SALARY_CUTOFFS = [5, 20];

export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Determines which salary cutoff period a PayLater due date belongs to.
 * 
 * Rules:
 * - A cutoff period begins on the cutoff date and covers until the day before the next cutoff.
 * - If salary cutoffs are [5, 20]:
 *   - 5th cutoff covers 5th through 19th.
 *   - 20th cutoff covers 20th through the 4th of the following month.
 * - Due dates before the first cutoff of the month (e.g. 1st - 4th) belong to the last cutoff of the previous month.
 */
export function getCutoffForDate(
  dueDateInput: string | Date,
  cutoffsInput: number[] = DEFAULT_SALARY_CUTOFFS
): CutoffPeriod {
  let year: number;
  let month: number;
  let day: number;

  if (typeof dueDateInput === "string" && /^\d{4}-\d{2}-\d{2}/.test(dueDateInput)) {
    const parts = dueDateInput.split("T")[0].split("-");
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    const d = new Date(dueDateInput);
    year = d.getFullYear();
    month = d.getMonth();
    day = d.getDate();
  }

  const sortedCutoffs = [...new Set(cutoffsInput)]
    .filter((c) => Number.isInteger(c) && c >= 1 && c <= 31)
    .sort((a, b) => a - b);

  if (sortedCutoffs.length === 0) {
    sortedCutoffs.push(...DEFAULT_SALARY_CUTOFFS);
  }

  const getEffectiveDay = (cDay: number, y: number, m: number) => {
    const daysInM = new Date(y, m + 1, 0).getDate();
    return Math.min(cDay, daysInM);
  };

  const firstCutoffEffective = getEffectiveDay(sortedCutoffs[0], year, month);

  let cycleYear = year;
  let cycleMonth = month;
  let matchedCutoffDay: number;
  let nextCutoffYear = year;
  let nextCutoffMonth = month;
  let nextCutoffDay: number;

  if (day < firstCutoffEffective) {
    // Falls into the last cutoff of previous month
    cycleMonth = month - 1;
    if (cycleMonth < 0) {
      cycleMonth = 11;
      cycleYear = year - 1;
    }
    matchedCutoffDay = sortedCutoffs[sortedCutoffs.length - 1];

    // The next cutoff after the last cutoff is the first cutoff of the current month
    nextCutoffYear = year;
    nextCutoffMonth = month;
    nextCutoffDay = sortedCutoffs[0];
  } else {
    let idx = 0;
    for (let i = 0; i < sortedCutoffs.length; i++) {
      const eff = getEffectiveDay(sortedCutoffs[i], year, month);
      if (day >= eff) {
        idx = i;
      } else {
        break;
      }
    }
    matchedCutoffDay = sortedCutoffs[idx];

    if (idx + 1 < sortedCutoffs.length) {
      nextCutoffYear = year;
      nextCutoffMonth = month;
      nextCutoffDay = sortedCutoffs[idx + 1];
    } else {
      // Wraps to next month's first cutoff
      nextCutoffMonth = month + 1;
      if (nextCutoffMonth > 11) {
        nextCutoffMonth = 0;
        nextCutoffYear = year + 1;
      }
      nextCutoffDay = sortedCutoffs[0];
    }
  }

  const startEffDay = getEffectiveDay(matchedCutoffDay, cycleYear, cycleMonth);
  const startDate = new Date(cycleYear, cycleMonth, startEffDay, 0, 0, 0, 0);

  const nextEffDay = getEffectiveDay(nextCutoffDay, nextCutoffYear, nextCutoffMonth);
  const endDate = new Date(nextCutoffYear, nextCutoffMonth, nextEffDay - 1, 23, 59, 59, 999);

  const isEndOfMonth = matchedCutoffDay >= 31;
  const cutoffLabel = isEndOfMonth ? "End-of-Month Cutoff" : `${getOrdinal(matchedCutoffDay)} Cutoff`;
  const shortLabel = isEndOfMonth ? "End-of-Month" : `${getOrdinal(matchedCutoffDay)}`;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const startStr = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}`;
  const endStr = `${monthNames[endDate.getMonth()]} ${endDate.getDate()}`;
  const periodLabel = `${startStr} – ${endStr}`;
  const cycleMonthLabel = `${fullMonthNames[cycleMonth]} ${cycleYear}`;
  const key = `${cycleYear}-${String(cycleMonth + 1).padStart(2, "0")}-${String(matchedCutoffDay).padStart(2, "0")}`;

  const now = new Date();
  const isCurrent = now >= startDate && now <= endDate;

  return {
    cutoffDay: matchedCutoffDay,
    label: cutoffLabel,
    shortLabel,
    periodLabel,
    cycleMonthLabel,
    key,
    startDate,
    endDate,
    isCurrent,
  };
}

export function getCurrentCutoffPeriod(cutoffsInput: number[] = DEFAULT_SALARY_CUTOFFS): CutoffPeriod {
  return getCutoffForDate(new Date(), cutoffsInput);
}

export function parseCutoffs(value?: string | null): number[] {
  if (!value) return DEFAULT_SALARY_CUTOFFS;
  const parts = value
    .split(/[,&-]/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 31);
  const unique = [...new Set(parts)].sort((a, b) => a - b);
  return unique.length > 0 ? unique : DEFAULT_SALARY_CUTOFFS;
}

export function serializeCutoffs(cutoffs: number[]): string {
  return cutoffs.join(",");
}
