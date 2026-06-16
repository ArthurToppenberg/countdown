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

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

type AuthResponse = {
  error?: string;
};

const authCopy: Record<
  AuthMode,
  {
    title: string;
    description: string;
    submitLabel: string;
    endpoint: string;
  }
> = {
  login: {
    title: "Log ind",
    description: "Log ind for at få adgang til din konto.",
    submitLabel: "Log ind",
    endpoint: "/api/auth/login",
  },
  register: {
    title: "Opret konto",
    description: "Opret en ny konto med e-mail og adgangskode.",
    submitLabel: "Opret konto",
    endpoint: "/api/auth/register",
  },
};

export const AuthForm = ({ mode, nextPath }: AuthFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = authCopy[mode];

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch(copy.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        ...(mode === "register" ? { name } : {}),
      }),
    });

    const responseText = await response.text();
    let data: AuthResponse = { error: "Noget gik galt. Prøv igen." };

    if (responseText) {
      try {
        data = JSON.parse(responseText) as AuthResponse;
      } catch {
        data = { error: "Noget gik galt. Prøv igen." };
      }
    }

    if (!response.ok) {
      setError(data.error ?? "Noget gik galt. Prøv igen.");
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath?.startsWith("/") ? nextPath : "/");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Dit navn"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="dig@eksempel.dk"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Adgangskode</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
              minLength={mode === "register" ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                mode === "register" ? "Mindst 8 tegn" : "Din adgangskode"
              }
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Vent..." : copy.submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
