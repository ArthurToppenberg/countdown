export type SetPasswordEmailInput = {
  to: string;
  name: string | null;
  setPasswordUrl: string;
};

export const formatEmailGreeting = (name: string | null): string =>
  name ? `Hej ${name}` : "Hej";
