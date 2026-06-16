import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  bodyStyle,
  buttonSectionStyle,
  buttonStyle,
  mutedStyle,
  nameHighlightStyle,
} from "./email-styles";

export type PasswordResetEmailProps = {
  name: string;
  setPasswordUrl: string;
};

export const PasswordResetEmail = ({
  name,
  setPasswordUrl,
}: PasswordResetEmailProps) => (
  <EmailLayout preview="Nulstil din adgangskode">
    <Text style={bodyStyle}>
      Hej <span style={nameHighlightStyle}>{name}</span>,
    </Text>

    <Text style={bodyStyle}>
      En administrator har nulstillet din adgangskode på Countdown.
    </Text>

    <Text style={bodyStyle}>
      Klik på linket herunder for at vælge en ny adgangskode:
    </Text>

    <Section style={buttonSectionStyle}>
      <Button href={setPasswordUrl} style={buttonStyle}>
        Vælg ny adgangskode
      </Button>
    </Section>

    <Text style={mutedStyle}>Linket udløber om 7 dage.</Text>

    <Text style={mutedStyle}>
      Hvis du ikke forventede denne e-mail, kan du kontakte din
      administrator.
    </Text>
  </EmailLayout>
);
