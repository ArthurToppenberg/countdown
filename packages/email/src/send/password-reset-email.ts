import { sendReactEmail } from "../client";
import { requireUserName } from "../require-user-name";
import { type SetPasswordEmailInput } from "../types";
import { PasswordResetEmail } from "../templates/password-reset-email";

export const sendPasswordResetEmail = async (
  input: SetPasswordEmailInput,
): Promise<void> => {
  const name = requireUserName(
    input.name,
    "Bruger mangler navn — kan ikke sende nulstillings-e-mail",
  );

  await sendReactEmail({
    emailType: "password-reset",
    to: input.to,
    subject: "Nulstil din adgangskode",
    react: PasswordResetEmail({
      name,
      setPasswordUrl: input.setPasswordUrl,
    }),
  });
};
