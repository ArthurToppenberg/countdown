import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  bodyStyle,
  buttonSectionStyle,
  buttonStyle,
  mutedStyle,
  nameHighlightStyle,
} from "./email-styles";

export type WelcomeEmailProps = {
  name: string;
  setPasswordUrl: string;
};

export const WelcomeEmail = ({ name, setPasswordUrl }: WelcomeEmailProps) => (
  <EmailLayout preview="Velkommen til Countdown">
    <Text style={bodyStyle}>
      Hej <span style={nameHighlightStyle}>{name}</span>,
    </Text>

    <Text style={bodyStyle}>
      Yo, du er blevet added til den nye legendariske v2 countdown til alle
      vores pisse fede festivaller.
    </Text>

    <Text style={bodyStyle}>
      Når du har logget ind så begynder jeg på de sjove daglige games hvor
      vi kongurere for at optjene point.
    </Text>

    <Text style={bodyStyle}>
      Klik på linket herunder for at vælge din adgangskode:
    </Text>

    <Section style={buttonSectionStyle}>
      <Button href={setPasswordUrl} style={buttonStyle}>
        Vælg adgangskode
      </Button>
    </Section>

    <Text style={mutedStyle}>Linket udløber om 7 dage.</Text>

    <Text style={mutedStyle}>
      Hvis du ikke forventede denne e-mail, kan du ignorere den.
    </Text>
  </EmailLayout>
);
