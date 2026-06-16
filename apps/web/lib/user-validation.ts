import { isValidEmail } from "@/lib/validation";

export type UserRole = "ADMIN" | "USER";

export type UserFormInput = {
  email: string;
  name: string;
  role: UserRole;
};

export type UserFormValues = {
  email: string;
  name: string;
  role: UserRole;
};

export type UserValidationResult =
  | { success: true; data: UserFormValues }
  | { success: false; error: string };

export const parseUserForm = (input: UserFormInput): UserValidationResult => {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email) {
    return { success: false, error: "E-mail er påkrævet." };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Angiv en gyldig e-mailadresse." };
  }

  if (!name) {
    return { success: false, error: "Navn er påkrævet." };
  }

  if (input.role !== "ADMIN" && input.role !== "USER") {
    return { success: false, error: "Ugyldig rolle." };
  }

  return {
    success: true,
    data: {
      email,
      name,
      role: input.role,
    },
  };
};
