"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@countdown/ui/components/button";

type LogoutButtonProps = {
  email: string;
  showAdminLink?: boolean;
};

export const LogoutButton = ({ email, showAdminLink = false }: LogoutButtonProps) => {
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
      {showAdminLink ? (
        <Link href="/admin">
          <Button type="button" size="sm">
            Gå til admin
          </Button>
        </Link>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
        Log ud
      </Button>
    </div>
  );
};
