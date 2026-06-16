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
