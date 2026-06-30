import { cn } from "@countdown/ui/lib/utils";

type FestivalEvent = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
};

type FestivalCalendarProps = {
  events: FestivalEvent[];
  today: Date;
};

type DayCell = {
  date: Date;
  inRange: boolean;
};

type DayAssignment = {
  event: FestivalEvent;
  colorIndex: number;
};

type FestivalColor = {
  bar: string;
};

const festivalColors: ReadonlyArray<FestivalColor> = [
  { bar: "bg-sky-500/30" },
  { bar: "bg-emerald-500/30" },
  { bar: "bg-amber-500/30" },
  { bar: "bg-violet-500/30" },
  { bar: "bg-orange-500/30" },
  { bar: "bg-teal-500/30" },
  { bar: "bg-fuchsia-500/30" },
  { bar: "bg-lime-500/30" },
  { bar: "bg-cyan-500/30" },
  { bar: "bg-indigo-500/30" },
];

const weekdayLabels = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;
const weekdayLabelsCompact = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"] as const;

const shortMonthFormatter = new Intl.DateTimeFormat("da-DK", {
  month: "short",
});

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}`;

const isSameDay = (a: Date, b: Date): boolean => dayKey(a) === dayKey(b);

const mondayIndex = (date: Date): number => (date.getDay() + 6) % 7;

const startOfWeek = (date: Date): Date => {
  const result = startOfDay(date);
  result.setDate(result.getDate() - mondayIndex(result));
  return result;
};

const colorForIndex = (index: number): FestivalColor =>
  festivalColors[index % festivalColors.length];

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatMonthLabel = (date: Date, showYear: boolean): string => {
  const month = capitalize(shortMonthFormatter.format(date).replace(".", ""));
  return showYear ? `${month} ${date.getFullYear()}` : month;
};

const buildSeasonStartLabels = (
  events: FestivalEvent[],
): Map<string, string> => {
  const sorted = [...events].sort(
    (left, right) => left.startDate.getTime() - right.startDate.getTime(),
  );
  const labels = new Map<string, string>();

  sorted.slice(0, -1).forEach((event, index) => {
    const seasonStart = startOfDay(event.endDate);
    seasonStart.setDate(seasonStart.getDate() + 1);
    const nextEvent = sorted[index + 1];
    labels.set(dayKey(seasonStart), `${nextEvent.name} Season`);
  });

  return labels;
};

const buildDayAssignments = (
  events: FestivalEvent[],
): Map<string, DayAssignment> => {
  const assignments = new Map<string, DayAssignment>();

  events.forEach((event, colorIndex) => {
    const end = startOfDay(event.endDate);
    const cursor = startOfDay(event.startDate);

    while (cursor <= end) {
      assignments.set(dayKey(cursor), { event, colorIndex });
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return assignments;
};

const calendarRange = (
  events: FestivalEvent[],
  today: Date,
): { rangeStart: Date; rangeEnd: Date } => {
  const milestones = [
    startOfDay(today),
    ...events.map((event) => startOfDay(event.startDate)),
    ...events.map((event) => startOfDay(event.endDate)),
  ];
  const earliest = milestones.reduce((a, b) => (a < b ? a : b));
  const latest = milestones.reduce((a, b) => (a > b ? a : b));

  return {
    rangeStart: new Date(earliest.getFullYear(), earliest.getMonth(), 1),
    rangeEnd: new Date(latest.getFullYear(), latest.getMonth() + 1, 0),
  };
};

const buildWeeks = (rangeStart: Date, rangeEnd: Date): DayCell[][] => {
  const weeks: DayCell[][] = [];
  const gridEnd = startOfDay(rangeEnd);
  const cursor = startOfWeek(rangeStart);

  while (cursor <= gridEnd) {
    const week = Array.from({ length: weekdayLabels.length }, () => {
      const date = new Date(cursor);
      const inRange = date >= rangeStart && date <= rangeEnd;
      cursor.setDate(cursor.getDate() + 1);
      return { date, inRange };
    });
    weeks.push(week);
  }

  return weeks;
};

const buildWeekLabels = (weeks: DayCell[][]): (string | null)[] => {
  const labeledMonths = new Set<string>();
  const yearState: { value: number | null } = { value: null };

  return weeks.map((week) => {
    const labelDay = week.find(
      (cell) => cell.inRange && !labeledMonths.has(monthKey(cell.date)),
    );

    if (!labelDay) {
      return null;
    }

    labeledMonths.add(monthKey(labelDay.date));
    const showYear = yearState.value !== labelDay.date.getFullYear();
    yearState.value = labelDay.date.getFullYear();
    return formatMonthLabel(labelDay.date, showYear);
  });
};

const runRounding = (
  assignment: DayAssignment,
  date: Date,
  columnIndex: number,
): string => {
  const start = startOfDay(assignment.event.startDate);
  const end = startOfDay(assignment.event.endDate);
  const isRunStart = isSameDay(date, start) || columnIndex === 0;
  const isRunEnd =
    isSameDay(date, end) || columnIndex === weekdayLabels.length - 1;

  return cn(isRunStart && "rounded-l-md", isRunEnd && "rounded-r-md");
};

const shouldShowEventName = (
  assignment: DayAssignment,
  date: Date,
  week: DayCell[],
  columnIndex: number,
  assignments: Map<string, DayAssignment>,
): boolean => {
  const start = startOfDay(assignment.event.startDate);

  if (isSameDay(date, start)) {
    return true;
  }

  if (columnIndex === 0) {
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 1);
    const previousAssignment = assignments.get(dayKey(previousDate));
    return previousAssignment?.event.id !== assignment.event.id;
  }

  const previousCell = week[columnIndex - 1];

  if (!previousCell.inRange) {
    return true;
  }

  const previousAssignment = assignments.get(dayKey(previousCell.date));
  return previousAssignment?.event.id !== assignment.event.id;
};

export const FestivalCalendar = ({ events, today }: FestivalCalendarProps) => {
  const assignments = buildDayAssignments(events);
  const seasonStartLabels = buildSeasonStartLabels(events);
  const { rangeStart, rangeEnd } = calendarRange(events, today);
  const weeks = buildWeeks(rangeStart, rangeEnd);
  const weekLabels = buildWeekLabels(weeks);

  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3 sm:p-4">
      <div className="flex">
        <div className="hidden w-12 shrink-0 sm:block" />
        <div className="grid min-w-0 flex-1 grid-cols-7 text-center text-[0.5625rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-[0.625rem]">
          {weekdayLabels.map((label, index) => (
            <span key={label} className="py-1">
              <span className="sm:hidden">{weekdayLabelsCompact[index]}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={week[0].date.toISOString()}>
            {weekLabels[weekIndex] ? (
              <div className="mb-1 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">
                {weekLabels[weekIndex]}
              </div>
            ) : null}
            <div className="flex items-stretch">
              <div className="hidden w-12 shrink-0 items-center pr-2 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground sm:flex">
                {weekLabels[weekIndex]}
              </div>

              <div className="grid min-w-0 flex-1 grid-cols-7">
                {week.map((cell, columnIndex) => {
                  if (!cell.inRange) {
                    return (
                      <div
                        key={cell.date.toISOString()}
                        className="h-8 sm:h-9"
                        aria-hidden
                      />
                    );
                  }

                  const assignment = assignments.get(dayKey(cell.date));
                  const isToday = isSameDay(cell.date, today);
                  const seasonName = seasonStartLabels.get(dayKey(cell.date));
                  const color = assignment
                    ? colorForIndex(assignment.colorIndex)
                    : null;
                  const showEventName = assignment
                    ? shouldShowEventName(
                        assignment,
                        cell.date,
                        week,
                        columnIndex,
                        assignments,
                      )
                    : false;

                  return (
                    <div
                      key={cell.date.toISOString()}
                      className="relative flex h-8 items-center justify-center sm:h-9"
                    >
                      <div
                        className={cn(
                          "relative flex h-full w-full items-center justify-center text-xs sm:text-sm",
                          assignment && color
                            ? cn(
                                color.bar,
                                "font-medium text-foreground",
                                runRounding(assignment, cell.date, columnIndex),
                              )
                            : "text-muted-foreground",
                        )}
                      >
                        {showEventName && assignment ? (
                          <span className="pointer-events-none absolute inset-x-0 top-0.5 hidden truncate px-0.5 text-center text-[0.5625rem] leading-none font-medium sm:block">
                            {assignment.event.name}
                          </span>
                        ) : null}
                        <span className="tabular-nums">{cell.date.getDate()}</span>
                        {seasonName ? (
                          <span
                            className="pointer-events-none absolute top-0 left-0 z-10 flex items-center gap-0.5 leading-none text-amber-500"
                            title={seasonName}
                          >
                            <span
                              aria-hidden
                              className="text-[0.5625rem] sm:text-[0.625rem]"
                            >
                              ★
                            </span>
                            <span className="hidden whitespace-nowrap text-[0.5625rem] font-medium sm:inline">
                              {seasonName}
                            </span>
                          </span>
                        ) : null}
                      </div>
                      {isToday ? (
                        <span
                          aria-hidden
                          className="absolute bottom-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-red-500 ring-2 ring-background"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-3 border-t border-border/60 pt-3 text-[0.625rem] text-muted-foreground">
        {events.length > 0 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:hidden">
            {events.map((event, index) => (
              <span key={event.id} className="flex min-w-0 items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 shrink-0 rounded-sm",
                    colorForIndex(index).bar,
                  )}
                />
                <span className="truncate">{event.name}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-red-500 ring-2 ring-background"
            />
            I dag
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="text-amber-500">
              ★
            </span>
            Ny sæson
          </span>
        </div>
      </div>
    </div>
  );
};
