"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AuthTokenPayload } from "@/lib/auth";
import { Button } from "@countdown/ui/components/button";

type LogoutButtonProps = {
  email: string;
  role: AuthTokenPayload["role"];
};

export const LogoutButton = ({ email, role }: LogoutButtonProps) => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {email}
      </span>
      {role === "ADMIN" ? (
        <Link href="/admin">
          <Button type="button" variant="secondary" size="sm">
            Admin
          </Button>
        </Link>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
        Log ud
      </Button>
    </div>
  );
};
