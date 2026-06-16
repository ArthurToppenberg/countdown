import { sendReactEmail } from "../client";
import { requireUserName } from "../require-user-name";
import { type SetPasswordEmailInput } from "../types";
import { WelcomeEmail } from "../templates/welcome-email";

export const sendWelcomeEmail = async (
  input: SetPasswordEmailInput,
): Promise<void> => {
  const name = requireUserName(
    input.name,
    "Bruger mangler navn — kan ikke sende velkomst-e-mail",
  );

  await sendReactEmail({
    emailType: "welcome",
    to: input.to,
    subject: "Velkommen til Countdown",
    react: WelcomeEmail({
      name,
      setPasswordUrl: input.setPasswordUrl,
    }),
  });
};
