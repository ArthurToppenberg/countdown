const COPENHAGEN_TIME_ZONE = "Europe/Copenhagen";

export const getCopenhagenDateKey = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: COPENHAGEN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const isSameCopenhagenDay = (left: Date, right: Date): boolean =>
  getCopenhagenDateKey(left) === getCopenhagenDateKey(right);

export const getCopenhagenHour = (date: Date): number => {
  const hourPart = new Intl.DateTimeFormat("en-GB", {
    timeZone: COPENHAGEN_TIME_ZONE,
    hour: "numeric",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .find((part) => part.type === "hour");

  if (!hourPart) {
    throw new Error("Could not resolve Copenhagen hour");
  }

  return Number(hourPart.value);
};

export type CopenhagenWeekRange = {
  fromKey: string;
  toKey: string;
};

const parseDateKeyToUtc = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid Copenhagen date key: ${dateKey}`);
  }

  return new Date(Date.UTC(year, month - 1, day));
};

const formatUtcDateKey = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isoWeekdayIndex = (date: Date): number => (date.getUTCDay() + 6) % 7;

export const getCopenhagenWeekKey = (date: Date): string => {
  const day = parseDateKeyToUtc(getCopenhagenDateKey(date));

  day.setUTCDate(day.getUTCDate() - isoWeekdayIndex(day) + 3);
  const isoYear = day.getUTCFullYear();

  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  firstThursday.setUTCDate(
    firstThursday.getUTCDate() - isoWeekdayIndex(firstThursday) + 3,
  );

  const millisPerWeek = 7 * 24 * 60 * 60 * 1000;
  const week =
    1 + Math.round((day.getTime() - firstThursday.getTime()) / millisPerWeek);

  return `${isoYear}-W${String(week).padStart(2, "0")}`;
};

export const getCopenhagenWeekRange = (date: Date): CopenhagenWeekRange => {
  const day = parseDateKeyToUtc(getCopenhagenDateKey(date));

  const monday = new Date(day);
  monday.setUTCDate(monday.getUTCDate() - isoWeekdayIndex(day));

  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);

  return { fromKey: formatUtcDateKey(monday), toKey: formatUtcDateKey(sunday) };
};

export const getCopenhagenMinutesSinceMidnight = (date: Date): number => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: COPENHAGEN_TIME_ZONE,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const hourPart = parts.find((part) => part.type === "hour");
  const minutePart = parts.find((part) => part.type === "minute");

  if (!hourPart || !minutePart) {
    throw new Error("Could not resolve Copenhagen time");
  }

  return Number(hourPart.value) * 60 + Number(minutePart.value);
};
