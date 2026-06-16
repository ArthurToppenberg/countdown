export type EventStatus = "upcoming" | "live" | "past";

export type EventCountdown = {
  status: EventStatus;
  label: string;
};

export const getEventCountdown = (
  startDate: Date,
  endDate: Date,
  now: Date,
): EventCountdown => {
  if (now > endDate) {
    return { status: "past", label: "Afsluttet" };
  }

  if (now >= startDate) {
    return { status: "live", label: "Live nu" };
  }

  const diffMs = startDate.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return {
      status: "upcoming",
      label: days === 1 ? `${days} dag` : `${days} dage`,
    };
  }

  return {
    status: "upcoming",
    label: hours === 1 ? `${hours} time` : `${hours} timer`,
  };
};
