"use client";

import { MailIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import {
  sendDagligEmailToUser,
  setDagligEmailOptIn,
} from "@/app/admin/(dashboard)/daglig/actions";
import { DagligEmailPreviewFrame } from "@/components/daglig-email-preview-frame";
import { Button } from "@countdown/ui/components/button";
import { Input } from "@countdown/ui/components/input";
import { Switch } from "@countdown/ui/components/switch";

export type DagligUser = {
  id: string;
  email: string;
  name: string | null;
  dagligEmailOptIn: boolean;
};

type DagligManagerProps = {
  users: DagligUser[];
  subject: string | null;
  previewHtml: string | null;
  canSendEmail: boolean;
};

const matchesSearchQuery = (user: DagligUser, query: string): boolean => {
  const email = user.email.toLowerCase();
  const name = (user.name ?? "").toLowerCase();

  return email.includes(query) || name.includes(query);
};

export const DagligManager = ({
  users,
  subject,
  previewHtml,
  canSendEmail,
}: DagligManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingUserId, setSendingUserId] = useState<string | null>(null);
  const [successUserId, setSuccessUserId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [optInState, setOptInState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(users.map((user) => [user.id, user.dagligEmailOptIn])),
  );
  const [pendingOptInUserId, setPendingOptInUserId] = useState<string | null>(
    null,
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => matchesSearchQuery(user, normalizedQuery));
  }, [normalizedQuery, users]);

  const handleSend = async (user: DagligUser): Promise<void> => {
    setSendingUserId(user.id);
    setSuccessUserId(null);
    setRowErrors((current) => {
      const { [user.id]: _removed, ...rest } = current;
      return rest;
    });

    const result = await sendDagligEmailToUser(user.id);

    if (!result.success) {
      setRowErrors((current) => ({
        ...current,
        [user.id]: result.error,
      }));
      setSendingUserId(null);
      return;
    }

    setSuccessUserId(user.id);
    setSendingUserId(null);
  };

  const handleToggleOptIn = async (
    user: DagligUser,
    nextOptIn: boolean,
  ): Promise<void> => {
    setPendingOptInUserId(user.id);
    setOptInState((current) => ({ ...current, [user.id]: nextOptIn }));
    setRowErrors((current) => {
      const { [user.id]: _removed, ...rest } = current;
      return rest;
    });

    const result = await setDagligEmailOptIn(user.id, nextOptIn);

    if (!result.success) {
      setOptInState((current) => ({ ...current, [user.id]: !nextOptIn }));
      setRowErrors((current) => ({
        ...current,
        [user.id]: result.error,
      }));
    }

    setPendingOptInUserId(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Daglig</h1>
        <p className="text-sm text-muted-foreground">
          Send den daglige countdown-mail til brugere. Countdown hentes fra
          nærmeste begivenhed i databasen.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium">Brugere</h2>
            <p className="text-sm text-muted-foreground">
              Søg efter navn eller e-mail, og send daglig mail til en bruger.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Søg brugere"
              className="pl-8"
              onChange={(changeEvent) => setSearchQuery(changeEvent.target.value)}
              placeholder="Søg navn eller e-mail..."
              type="search"
              value={searchQuery}
            />
          </div>
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen brugere endnu.</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen brugere matcher søgningen.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Navn</th>
                  <th className="px-4 py-3 font-medium">Tilmeldt</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Handling</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSending = sendingUserId === user.id;
                  const sendSucceeded = successUserId === user.id;
                  const error = rowErrors[user.id];
                  const optedIn = optInState[user.id] ?? user.dagligEmailOptIn;
                  const isUpdatingOptIn = pendingOptInUserId === user.id;

                  return (
                    <tr key={user.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          aria-label={`Tilmeld ${user.email} til daglig mail`}
                          checked={optedIn}
                          disabled={isUpdatingOptIn}
                          onCheckedChange={(checked) =>
                            handleToggleOptIn(user, checked)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <Button
                            disabled={
                              !canSendEmail ||
                              !user.name?.trim() ||
                              !optedIn ||
                              isSending
                            }
                            onClick={() => handleSend(user)}
                            size="sm"
                          >
                            <MailIcon />
                            {isSending ? "Sender..." : "Send daglig mail"}
                          </Button>
                          {error ? (
                            <p
                              className="max-w-[220px] text-xs text-destructive"
                              role="alert"
                            >
                              {error}
                            </p>
                          ) : null}
                          {sendSucceeded ? (
                            <p className="max-w-[220px] text-xs text-muted-foreground">
                              Daglig mail sendt.
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
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">E-mail preview</h2>
          <p className="text-sm text-muted-foreground">
            Emne og indhold vises med dit navn som eksempel.
          </p>
        </div>

        {previewHtml && subject ? (
          <div className="overflow-hidden rounded-xl border bg-card ring-1 ring-foreground/10">
            <div className="border-b bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Emne
              </p>
              <p className="mt-1 text-sm font-medium">{subject}</p>
            </div>

            <DagligEmailPreviewFrame previewHtml={previewHtml} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ingen kommende begivenhed at sende mail for.
          </p>
        )}
      </section>
    </div>
  );
};
