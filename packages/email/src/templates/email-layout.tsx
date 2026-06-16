import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { type ReactNode } from "react";

import {
  cardStyle,
  eyebrowStyle,
  footerStyle,
  pageStyle,
  shellStyle,
} from "./email-styles";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Html lang="da">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={pageStyle}>
      <Container style={shellStyle}>
        <Section style={cardStyle}>
          <Text style={eyebrowStyle}>Countdown</Text>
          {children}
        </Section>
        <Text style={footerStyle}>Festivaltæller · Countdown</Text>
      </Container>
    </Body>
  </Html>
);
