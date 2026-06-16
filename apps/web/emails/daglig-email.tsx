import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type DagligEmailEventProps = {
  eventName: string;
  daysRemainingLabel: string;
};

export type DagligEmailProps = DagligEmailEventProps & {
  name: string;
  gameUrl: string;
};

export const getDagligEmailTitle = ({
  eventName,
  daysRemainingLabel,
}: DagligEmailEventProps): string => `${daysRemainingLabel} til ${eventName}`;

export const getDagligEmailSubject = (props: DagligEmailEventProps): string =>
  getDagligEmailTitle(props);

export const DagligEmail = (props: DagligEmailProps) => {
  const title = getDagligEmailTitle(props);

  return (
    <Html lang="da">
      <Head />
      <Preview>{title}</Preview>
      <Body style={pageStyle}>
        <Container style={shellStyle}>
          <Section style={cardStyle}>
            <Text style={eyebrowStyle}>Countdown</Text>

            <Section style={heroStyle}>
              <Text style={countdownStyle}>{props.daysRemainingLabel}</Text>
              <Text style={tilStyle}>til</Text>
              <Heading as="h1" style={eventNameStyle}>
                {props.eventName}
              </Heading>
            </Section>

            <Hr style={dividerStyle} />

            <Text style={bodyStyle}>
              Nååår{" "}
              <span style={nameHighlightStyle}>{props.name}</span> er du klar
              til et minigame.
            </Text>

            <Section style={buttonSectionStyle}>
              <Button href={props.gameUrl} style={buttonStyle}>
                Spil minigame
              </Button>
            </Section>
          </Section>

          <Text style={footerStyle}>Festivaltæller · Countdown</Text>
        </Container>
      </Body>
    </Html>
  );
};

const pageStyle = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0",
  padding: "40px 16px",
} as const;

const shellStyle = {
  margin: "0 auto",
  maxWidth: "480px",
} as const;

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "16px",
  padding: "32px 28px",
} as const;

const eyebrowStyle = {
  color: "#71717a",
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "0.14em",
  margin: "0 0 24px",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
};

const heroStyle = {
  backgroundColor: "#fafafa",
  border: "1px solid #e4e4e7",
  borderRadius: "12px",
  margin: "0 0 28px",
  padding: "28px 20px",
  textAlign: "center" as const,
};

const countdownStyle = {
  color: "#18181b",
  fontSize: "40px",
  fontWeight: "700",
  letterSpacing: "-0.03em",
  lineHeight: "1",
  margin: "0 0 8px",
};

const tilStyle = {
  color: "#a1a1aa",
  fontSize: "14px",
  fontWeight: "500",
  letterSpacing: "0.04em",
  margin: "0 0 10px",
  textTransform: "lowercase" as const,
};

const eventNameStyle = {
  color: "#18181b",
  fontSize: "22px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0",
};

const dividerStyle = {
  borderColor: "#e4e4e7",
  borderTop: "1px solid #e4e4e7",
  margin: "0 0 24px",
};

const bodyStyle = {
  color: "#3f3f46",
  fontSize: "17px",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "center" as const,
};

const nameHighlightStyle = {
  color: "#18181b",
  fontWeight: "600",
};

const buttonSectionStyle = {
  margin: "24px 0 0",
  textAlign: "center" as const,
};

const buttonStyle = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
};

const footerStyle = {
  color: "#a1a1aa",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "20px 0 0",
  textAlign: "center" as const,
};
