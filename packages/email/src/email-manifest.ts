import emailManifest from "../email.manifest.json";

export type EmailManifest = {
  emails: boolean;
};

const parsedManifest = emailManifest as EmailManifest;

const assertEmailManifestShape = (manifest: EmailManifest): void => {
  if (typeof manifest.emails !== "boolean") {
    throw new Error('email.manifest.json must have a boolean "emails" field');
  }
};

assertEmailManifestShape(parsedManifest);

export const isEmailEnabled = (): boolean => parsedManifest.emails;
