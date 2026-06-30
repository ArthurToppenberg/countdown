"use client";

import { CheckIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/app/admin/(dashboard)/events/actions";
import { toDatetimeLocalValue } from "@/lib/event-validation";
import { Button } from "@countdown/ui/components/button";
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

type EventRowState = EventFormState;

const emptyFormState = (): EventFormState => ({
  name: "",
  description: "",
  startDate: "",
  endDate: "",
});

const toRowState = (event: AdminEvent): EventRowState => ({
  name: event.name,
  description: event.description ?? "",
  startDate: toDatetimeLocalValue(new Date(event.startDate)),
  endDate: toDatetimeLocalValue(new Date(event.endDate)),
});

const isRowDirty = (event: AdminEvent, rowState: EventRowState): boolean => {
  const original = toRowState(event);
  return (
    rowState.name !== original.name ||
    rowState.description !== original.description ||
    rowState.startDate !== original.startDate ||
    rowState.endDate !== original.endDate
  );
};

export const EventsManager = ({ events }: EventsManagerProps) => {
  const router = useRouter();
  const [rowStates, setRowStates] = useState<Record<string, EventRowState>>(() =>
    Object.fromEntries(events.map((event) => [event.id, toRowState(event)])),
  );
  const [savingEventId, setSavingEventId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createFormState, setCreateFormState] = useState<EventFormState>(
    emptyFormState,
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setRowStates(
      Object.fromEntries(events.map((event) => [event.id, toRowState(event)])),
    );
  }, [events]);

  const updateRowState = (
    eventId: string,
    field: keyof EventRowState,
    value: string,
  ): void => {
    setRowStates((current) => ({
      ...current,
      [eventId]: {
        ...current[eventId],
        [field]: value,
      },
    }));
    setRowErrors((current) => {
      const { [eventId]: _removed, ...rest } = current;
      return rest;
    });
  };

  const handleSave = async (event: AdminEvent): Promise<void> => {
    const rowState = rowStates[event.id];

    if (!rowState || !isRowDirty(event, rowState)) {
      return;
    }

    setSavingEventId(event.id);
    const result = await updateEvent(event.id, rowState);

    if (!result.success) {
      setRowErrors((current) => ({
        ...current,
        [event.id]: result.error,
      }));
      setSavingEventId(null);
      return;
    }

    setSavingEventId(null);
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
      setRowErrors((current) => ({
        ...current,
        [event.id]: result.error,
      }));
      setDeletingEventId(null);
      return;
    }

    setDeletingEventId(null);
    router.refresh();
  };

  const openCreateSheet = (): void => {
    setCreateFormState(emptyFormState());
    setCreateError(null);
    setSheetOpen(true);
  };

  const closeCreateSheet = (): void => {
    setSheetOpen(false);
    setCreateFormState(emptyFormState());
    setCreateError(null);
  };

  const handleCreate = async (
    submitEvent: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    submitEvent.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    const result = await createEvent(createFormState);

    if (!result.success) {
      setCreateError(result.error);
      setIsCreating(false);
      return;
    }

    closeCreateSheet();
    setIsCreating(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Begivenheder</h1>
          <p className="text-sm text-muted-foreground">
            Rediger begivenheder direkte i tabellen.
          </p>
        </div>
        <Button onClick={openCreateSheet}>
          <PlusIcon />
          Ny begivenhed
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ingen begivenheder endnu.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium">Navn</th>
                <th className="px-4 py-3 font-medium">Beskrivelse</th>
                <th className="px-4 py-3 font-medium">Startdato</th>
                <th className="px-4 py-3 font-medium">Slutdato</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const rowState = rowStates[event.id] ?? toRowState(event);
                const dirty = isRowDirty(event, rowState);
                const isSaving = savingEventId === event.id;
                const isDeleting = deletingEventId === event.id;
                const error = rowErrors[event.id];

                return (
                  <tr key={event.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 align-top">
                      <Input
                        value={rowState.name}
                        onChange={(changeEvent) =>
                          updateRowState(event.id, "name", changeEvent.target.value)
                        }
                        aria-label={`Navn for ${event.name}`}
                        className="min-w-[160px]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Input
                        value={rowState.description}
                        onChange={(changeEvent) =>
                          updateRowState(
                            event.id,
                            "description",
                            changeEvent.target.value,
                          )
                        }
                        aria-label={`Beskrivelse for ${event.name}`}
                        placeholder="—"
                        className="min-w-[180px]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Input
                        type="datetime-local"
                        value={rowState.startDate}
                        onChange={(changeEvent) =>
                          updateRowState(
                            event.id,
                            "startDate",
                            changeEvent.target.value,
                          )
                        }
                        aria-label={`Startdato for ${event.name}`}
                        className="min-w-[180px]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Input
                        type="datetime-local"
                        value={rowState.endDate}
                        onChange={(changeEvent) =>
                          updateRowState(
                            event.id,
                            "endDate",
                            changeEvent.target.value,
                          )
                        }
                        aria-label={`Slutdato for ${event.name}`}
                        className="min-w-[180px]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleSave(event)}
                            disabled={!dirty || isSaving || isDeleting}
                          >
                            <CheckIcon />
                            {isSaving ? "Gemmer..." : "Gem"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(event)}
                            disabled={isSaving || isDeleting}
                            aria-label={`Slet ${event.name}`}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                        {error ? (
                          <p
                            className="max-w-[180px] text-xs text-destructive"
                            role="alert"
                          >
                            {error}
                          </p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => !open && closeCreateSheet()}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Ny begivenhed</SheetTitle>
            <SheetDescription>
              Tilføj en ny festivalbegivenhed til tidslinjen.
            </SheetDescription>
          </SheetHeader>

          <form
            id="event-create-form"
            className="flex flex-col gap-4 px-4"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-name">Navn</Label>
              <Input
                id="event-name"
                value={createFormState.name}
                onChange={(changeEvent) =>
                  setCreateFormState((current) => ({
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
                value={createFormState.description}
                onChange={(changeEvent) =>
                  setCreateFormState((current) => ({
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
                value={createFormState.startDate}
                onChange={(changeEvent) =>
                  setCreateFormState((current) => ({
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
                value={createFormState.endDate}
                onChange={(changeEvent) =>
                  setCreateFormState((current) => ({
                    ...current,
                    endDate: changeEvent.target.value,
                  }))
                }
                required
              />
            </div>

            {createError ? (
              <p className="text-sm text-destructive" role="alert">
                {createError}
              </p>
            ) : null}
          </form>

          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateSheet}
              disabled={isCreating}
            >
              Annuller
            </Button>
            <Button type="submit" form="event-create-form" disabled={isCreating}>
              {isCreating ? "Opretter..." : "Opret begivenhed"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
