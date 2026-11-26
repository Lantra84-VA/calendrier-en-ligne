export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number): Date => {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const addMonths = (date: Date, months: number): Date => {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + months;
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(targetYear, targetMonth, Math.min(date.getDate(), daysInTargetMonth));
};

/** The Monday of the week holding `date`. */
export const startOfWeek = (date: Date): Date => {
  const offset = (date.getDay() + 6) % 7;
  return addDays(date, -offset);
};

export const isSameDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const monthLabel = (date: Date): string =>
  new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);

export const dayLabel = (date: Date): string =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

export const timeLabel = (date: Date): string =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);

export const weekdayLabels = (): string[] => {
  const monday = startOfDay(new Date(2024, 0, 1));
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(addDays(monday, index))
  );
};

/** The six week rows a month grid shows: 42 days starting at the month's first Monday. */
export const monthGrid = (date: Date): Date[] => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
};

export const toDateInputValue = (date: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const toTimeInputValue = (date: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** A `date` + `time` pair of `<input>` values, read as one local `Date`; null when either is empty. */
export const combineInputValues = (date: string, time: string): Date | null => {
  if (!date || !time) {
    return null;
  }
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const endOfDay = (date: Date): Date => addDays(date, 1);
