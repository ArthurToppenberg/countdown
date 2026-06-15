"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/app/admin/events/actions";
import { toDatetimeLocalValue } from "@/lib/event-validation";
import { Button } from "@countdown/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@countdown/ui/components/card";
import { Input } from "@countdown/ui/components/input";
import { Label } from "@countdown/ui/components/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@countdown/ui/components/sheet";
import { Textarea } from "@countdown/ui/components/textarea";

export type AdminEvent = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
};

type EventsManagerProps = {
  events: AdminEvent[];
};

type EventFormState = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};

const emptyFormState = (): EventFormState => ({
  name: "",
  description: "",
  startDate: "",
  endDate: "",
});

const shortMonthFormatter = new Intl.DateTimeFormat("da-DK", {
  month: "short",
});

const dayFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
});

const dayMonthFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
});

const fullDateFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const formatDateRange = (startDate: Date, endDate: Date): string => {
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth) {
    return `${dayFormatter.format(startDate)}.–${dayFormatter.format(endDate)}. ${shortMonthFormatter.format(startDate)} ${startDate.getFullYear()}`;
  }

  if (sameYear) {
    return `${dayMonthFormatter.format(startDate)} – ${dayMonthFormatter.format(endDate)} ${startDate.getFullYear()}`;
  }

  return `${fullDateFormatter.format(startDate)} – ${fullDateFormatter.format(endDate)}`;
};

const toFormState = (event: AdminEvent): EventFormState => ({
  name: event.name,
  description: event.description ?? "",
  startDate: toDatetimeLocalValue(new Date(event.startDate)),
  endDate: toDatetimeLocalValue(new Date(event.endDate)),
});

export const EventsManager = ({ events }: EventsManagerProps) => {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(emptyFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const isEditing = editingEventId !== null;
  const sheetTitle = isEditing ? "Rediger begivenhed" : "Ny begivenhed";
  const sheetDescription = isEditing
    ? "Opdater detaljerne for begivenheden."
    : "Tilføj en ny festivalbegivenhed til tidslinjen.";

  const openCreateSheet = (): void => {
    setEditingEventId(null);
    setFormState(emptyFormState());
    setError(null);
    setSheetOpen(true);
  };

  const openEditSheet = (event: AdminEvent): void => {
    setEditingEventId(event.id);
    setFormState(toFormState(event));
    setError(null);
    setSheetOpen(true);
  };

  const closeSheet = (): void => {
    setSheetOpen(false);
    setEditingEventId(null);
    setFormState(emptyFormState());
    setError(null);
  };

  const handleSubmit = async (
    submitEvent: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    submitEvent.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result =
      editingEventId === null
        ? await createEvent(formState)
        : await updateEvent(editingEventId, formState);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    closeSheet();
    setIsSubmitting(false);
    router.refresh();
  };

  const handleDelete = async (event: AdminEvent): Promise<void> => {
    const confirmed = window.confirm(
      `Er du sikker på, at du vil slette "${event.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingEventId(event.id);
    const result = await deleteEvent(event.id);

    if (!result.success) {
      setError(result.error);
      setDeletingEventId(null);
      return;
    }

    setDeletingEventId(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Begivenheder</h1>
          <p className="text-sm text-muted-foreground">
            Administrer festivalbegivenheder på forsiden.
          </p>
        </div>
        <Button onClick={openCreateSheet}>
          <PlusIcon />
          Ny begivenhed
        </Button>
      </div>

      {error && !sheetOpen ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ingen begivenheder</CardTitle>
            <CardDescription>
              Opret din første begivenhed for at vise den på tidslinjen.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            const isDeleting = deletingEventId === event.id;

            return (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    <time dateTime={event.startDate}>
                      {formatDateRange(startDate, endDate)}
                    </time>
                    {event.description ? (
                      <span className="mt-1.5 block">{event.description}</span>
                    ) : null}
                  </CardDescription>
                  <CardAction className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => openEditSheet(event)}
                      aria-label={`Rediger ${event.name}`}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => handleDelete(event)}
                      disabled={isDeleting}
                      aria-label={`Slet ${event.name}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription>{sheetDescription}</SheetDescription>
          </SheetHeader>

          <form
            id="event-form"
            className="flex flex-col gap-4 px-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-name">Navn</Label>
              <Input
                id="event-name"
                value={formState.name}
                onChange={(changeEvent) =>
                  setFormState((current) => ({
                    ...current,
                    name: changeEvent.target.value,
                  }))
                }
                placeholder="Roskilde Festival"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-description">Beskrivelse</Label>
              <Textarea
                id="event-description"
                value={formState.description}
                onChange={(changeEvent) =>
                  setFormState((current) => ({
                    ...current,
                    description: changeEvent.target.value,
                  }))
                }
                placeholder="Kort beskrivelse af begivenheden"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-start-date">Startdato</Label>
              <Input
                id="event-start-date"
                type="datetime-local"
                value={formState.startDate}
                onChange={(changeEvent) =>
                  setFormState((current) => ({
                    ...current,
                    startDate: changeEvent.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-end-date">Slutdato</Label>
              <Input
                id="event-end-date"
                type="datetime-local"
                value={formState.endDate}
                onChange={(changeEvent) =>
                  setFormState((current) => ({
                    ...current,
                    endDate: changeEvent.target.value,
                  }))
                }
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </form>

          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeSheet}
              disabled={isSubmitting}
            >
              Annuller
            </Button>
            <Button type="submit" form="event-form" disabled={isSubmitting}>
              {isSubmitting
                ? "Gemmer..."
                : isEditing
                  ? "Gem ændringer"
                  : "Opret begivenhed"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
