import { SetPasswordForm } from "@/components/set-password-form";

type SetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function SetPasswordPage({
  searchParams,
}: SetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16">
      {token ? (
        <SetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Ugyldigt eller udløbet link. Kontakt en administrator for at få et nyt
          link.
        </p>
      )}
    </main>
  );
}
