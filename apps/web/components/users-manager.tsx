"use client";

import { CheckIcon, KeyRoundIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createUser,
  deleteUser,
  resetUserPassword,
  updateUser,
} from "@/app/admin/(dashboard)/brugere/actions";
import { type UserRole } from "@/lib/user-validation";
import { Badge } from "@countdown/ui/components/badge";
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

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  hasPassword: boolean;
};

type UsersManagerProps = {
  users: AdminUser[];
};

type UserRowState = {
  email: string;
  name: string;
  role: UserRole;
};

type UserCreateFormState = UserRowState;

const emptyCreateFormState = (): UserCreateFormState => ({
  email: "",
  name: "",
  role: "USER",
});

const toRowState = (user: AdminUser): UserRowState => ({
  email: user.email,
  name: user.name ?? "",
  role: user.role,
});

const isRowDirty = (user: AdminUser, rowState: UserRowState): boolean =>
  rowState.email !== user.email ||
  rowState.name !== (user.name ?? "") ||
  rowState.role !== user.role;

const dateFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const roleLabel: Record<UserRole, string> = {
  ADMIN: "Admin",
  USER: "Bruger",
};

export const UsersManager = ({ users }: UsersManagerProps) => {
  const router = useRouter();
  const [rowStates, setRowStates] = useState<Record<string, UserRowState>>(() =>
    Object.fromEntries(users.map((user) => [user.id, toRowState(user)])),
  );
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetSuccessUserId, setResetSuccessUserId] = useState<string | null>(
    null,
  );
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createFormState, setCreateFormState] = useState<UserCreateFormState>(
    emptyCreateFormState,
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setRowStates(
      Object.fromEntries(users.map((user) => [user.id, toRowState(user)])),
    );
  }, [users]);

  const updateRowState = (
    userId: string,
    field: keyof UserRowState,
    value: string,
  ): void => {
    setRowStates((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [field]: value,
      },
    }));
    setRowErrors((current) => {
      const { [userId]: _removed, ...rest } = current;
      return rest;
    });
  };

  const handleSave = async (user: AdminUser): Promise<void> => {
    const rowState = rowStates[user.id];

    if (!rowState || !isRowDirty(user, rowState)) {
      return;
    }

    setSavingUserId(user.id);
    const result = await updateUser(user.id, rowState);

    if (!result.success) {
      setRowErrors((current) => ({
        ...current,
        [user.id]: result.error,
      }));
      setSavingUserId(null);
      return;
    }

    setSavingUserId(null);
    router.refresh();
  };

  const handleDelete = async (user: AdminUser): Promise<void> => {
    const confirmed = window.confirm(
      `Er du sikker på, at du vil slette "${user.email}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);
    setRowErrors((current) => {
      const { [user.id]: _removed, ...rest } = current;
      return rest;
    });

    const result = await deleteUser(user.id);

    if (!result.success) {
      setRowErrors((current) => ({
        ...current,
        [user.id]: result.error,
      }));
      setDeletingUserId(null);
      return;
    }

    setDeletingUserId(null);
    router.refresh();
  };

  const handleResetPassword = async (user: AdminUser): Promise<void> => {
    setResettingUserId(user.id);
    setResetSuccessUserId(null);
    setRowErrors((current) => {
      const { [user.id]: _removed, ...rest } = current;
      return rest;
    });

    const result = await resetUserPassword(user.id);

    if (!result.success) {
      setRowErrors((current) => ({
        ...current,
        [user.id]: result.error,
      }));
      setResettingUserId(null);
      return;
    }

    setResettingUserId(null);
    setResetSuccessUserId(user.id);
    router.refresh();
  };

  const openCreateSheet = (): void => {
    setCreateFormState(emptyCreateFormState());
    setCreateError(null);
    setSheetOpen(true);
  };

  const closeCreateSheet = (): void => {
    setSheetOpen(false);
    setCreateFormState(emptyCreateFormState());
    setCreateError(null);
  };

  const handleCreate = async (
    submitEvent: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    submitEvent.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    const result = await createUser(createFormState);

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
          <h1 className="text-2xl font-semibold tracking-tight">Brugere</h1>
          <p className="text-sm text-muted-foreground">
            Rediger brugeroplysninger direkte i tabellen.
          </p>
        </div>
        <Button onClick={openCreateSheet}>
          <PlusIcon />
          Ny bruger
        </Button>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ingen brugere endnu.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Navn</th>
                <th className="px-4 py-3 font-medium">Rolle</th>
                <th className="px-4 py-3 font-medium">Adgangskode</th>
                <th className="px-4 py-3 font-medium">Oprettet</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rowState = rowStates[user.id] ?? toRowState(user);
                const dirty = isRowDirty(user, rowState);
                const isSaving = savingUserId === user.id;
                const isDeleting = deletingUserId === user.id;
                const isResetting = resettingUserId === user.id;
                const resetSucceeded = resetSuccessUserId === user.id;
                const error = rowErrors[user.id];

                return (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 align-top">
                      <Input
                        value={rowState.email}
                        onChange={(changeEvent) =>
                          updateRowState(
                            user.id,
                            "email",
                            changeEvent.target.value,
                          )
                        }
                        aria-label={`E-mail for ${user.email}`}
                        type="email"
                        className="min-w-[200px]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Input
                        value={rowState.name}
                        onChange={(changeEvent) =>
                          updateRowState(
                            user.id,
                            "name",
                            changeEvent.target.value,
                          )
                        }
                        aria-label={`Navn for ${user.email}`}
                        placeholder="—"
                        className="min-w-[160px]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        value={rowState.role}
                        onChange={(changeEvent) =>
                          updateRowState(
                            user.id,
                            "role",
                            changeEvent.target.value,
                          )
                        }
                        aria-label={`Rolle for ${user.email}`}
                        className="h-8 w-full min-w-[120px] rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                      >
                        <option value="USER">{roleLabel.USER}</option>
                        <option value="ADMIN">{roleLabel.ADMIN}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={user.hasPassword ? "secondary" : "outline"}>
                        {user.hasPassword ? "Aktiv" : "Afventer"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <time
                        className="pt-1 text-muted-foreground"
                        dateTime={user.createdAt}
                      >
                        {dateFormatter.format(new Date(user.createdAt))}
                      </time>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleSave(user)}
                            disabled={
                              !dirty ||
                              !rowState.name.trim() ||
                              isSaving ||
                              isDeleting ||
                              isResetting
                            }
                          >
                            <CheckIcon />
                            {isSaving ? "Gemmer..." : "Gem"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            disabled={
                              !user.name?.trim() ||
                              isSaving ||
                              isDeleting ||
                              isResetting
                            }
                            aria-label={`Nulstil adgangskode for ${user.email}`}
                          >
                            <KeyRoundIcon />
                            {isResetting ? "Sender..." : "Nulstil"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={isSaving || isDeleting || isResetting}
                            aria-label={`Slet ${user.email}`}
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
                        {resetSucceeded ? (
                          <p className="max-w-[180px] text-xs text-muted-foreground">
                            Nulstillings-e-mail sendt.
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
            <SheetTitle>Ny bruger</SheetTitle>
            <SheetDescription>
              Opret en ny bruger. Vedkommende modtager en velkomst-e-mail med et
              link til at vælge adgangskode.
            </SheetDescription>
          </SheetHeader>

          <form
            id="user-create-form"
            className="flex flex-col gap-4 px-4"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email">E-mail</Label>
              <Input
                id="user-email"
                type="email"
                value={createFormState.email}
                onChange={(changeEvent) =>
                  setCreateFormState((current) => ({
                    ...current,
                    email: changeEvent.target.value,
                  }))
                }
                placeholder="bruger@eksempel.dk"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-name">Navn</Label>
              <Input
                id="user-name"
                value={createFormState.name}
                onChange={(changeEvent) =>
                  setCreateFormState((current) => ({
                    ...current,
                    name: changeEvent.target.value,
                  }))
                }
                placeholder="Fornavn"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-role">Rolle</Label>
              <select
                id="user-role"
                value={createFormState.role}
                onChange={(changeEvent) =>
                  setCreateFormState((current) => ({
                    ...current,
                    role: changeEvent.target.value as UserRole,
                  }))
                }
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="USER">{roleLabel.USER}</option>
                <option value="ADMIN">{roleLabel.ADMIN}</option>
              </select>
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
            <Button
              type="submit"
              form="user-create-form"
              disabled={isCreating || !createFormState.name.trim()}
            >
              {isCreating ? "Opretter..." : "Opret bruger"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
