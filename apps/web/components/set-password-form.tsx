"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@countdown/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@countdown/ui/components/card";
import { Input } from "@countdown/ui/components/input";
import { Label } from "@countdown/ui/components/label";

type SetPasswordFormProps = {
  token: string;
};

type SetPasswordResponse = {
  error?: string;
};

export const SetPasswordForm = ({ token }: SetPasswordFormProps) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Adgangskoderne matcher ikke.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const responseText = await response.text();
    let data: SetPasswordResponse = { error: "Noget gik galt. Prøv igen." };

    if (responseText) {
      try {
        data = JSON.parse(responseText) as SetPasswordResponse;
      } catch {
        data = { error: "Noget gik galt. Prøv igen." };
      }
    }

    if (!response.ok) {
      setError(data.error ?? "Noget gik galt. Prøv igen.");
      setIsSubmitting(false);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Vælg adgangskode</CardTitle>
        <CardDescription>
          Opret en adgangskode for at aktivere din konto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Adgangskode</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mindst 8 tegn"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">Bekræft adgangskode</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Gentag adgangskode"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Gemmer..." : "Gem adgangskode"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
