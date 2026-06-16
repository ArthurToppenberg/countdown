import { sendEmail } from "@/lib/email/client";
import { requireUserName } from "@/lib/email/require-user-name";
import { type SetPasswordEmailInput } from "@/lib/email/types";

export const sendPasswordResetEmail = async (
  input: SetPasswordEmailInput,
): Promise<void> => {
  const name = requireUserName(
    input.name,
    "Bruger mangler navn — kan ikke sende nulstillings-e-mail",
  );

  await sendEmail({
    emailType: "password-reset",
    to: input.to,
    subject: "Nulstil din adgangskode",
    html: `
      <p>Hej ${name},</p>
      <p>En administrator har nulstillet din adgangskode på Countdown.</p>
      <p>Klik på linket herunder for at vælge en ny adgangskode:</p>
      <p><a href="${input.setPasswordUrl}">Vælg ny adgangskode</a></p>
      <p>Linket udløber om 7 dage.</p>
      <p>Hvis du ikke forventede denne e-mail, kan du kontakte din administrator.</p>
    `,
  });
};
