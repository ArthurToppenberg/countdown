export type EventFormInput = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};

export type EventFormValues = {
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
};

export type EventValidationResult =
  | { success: true; data: EventFormValues }
  | { success: false; error: string };

export const parseEventForm = (input: EventFormInput): EventValidationResult => {
  const name = input.name.trim();
  const description = input.description.trim();

  if (!name) {
    return { success: false, error: "Navn er påkrævet." };
  }

  if (!input.startDate || !input.endDate) {
    return { success: false, error: "Start- og slutdato er påkrævet." };
  }

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { success: false, error: "Ugyldig dato." };
  }

  if (endDate < startDate) {
    return {
      success: false,
      error: "Slutdato skal være efter eller lig med startdato.",
    };
  }

  return {
    success: true,
    data: {
      name,
      description: description.length > 0 ? description : null,
      startDate,
      endDate,
    },
  };
};

export const toDatetimeLocalValue = (date: Date): string => {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};
