import { sendEmail } from "@/lib/email/client";
import {
  type SetPasswordEmailInput,
  formatEmailGreeting,
} from "@/lib/email/types";

export const sendWelcomeEmail = async (
  input: SetPasswordEmailInput,
): Promise<void> => {
  const greeting = formatEmailGreeting(input.name);

  await sendEmail({
    emailType: "welcome",
    to: input.to,
    subject: "Velkommen til Countdown",
    html: `
      <p>${greeting},</p>
      <p>Yo, du er blevet added til den nye legendariske v2 countdown til alle vores pisse fede festivaller.</p>
      <p>Når du har logget ind så begynder jeg på de sjove daglige minigames hvor vi kongurere for at optjene point</p>
      <p>Klik på linket herunder for at vælge din adgangskode:</p>
      <p><a href="${input.setPasswordUrl}">Vælg adgangskode</a></p>
      <p>Linket udløber om 7 dage.</p>
      <p>Hvis du ikke forventede denne e-mail, kan du ignorere den.</p>
    `,
  });
};
