import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from "@react-email/components";

import { type DagligEmailEventProps } from "../types";
import { EmailLayout } from "./email-layout";
import {
  bodyStyle,
  buttonSectionStyle,
  buttonStyle,
  nameHighlightStyle,
} from "./email-styles";

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
    <EmailLayout preview={title}>
      <Section style={heroStyle}>
        <Text style={countdownStyle}>{props.daysRemainingLabel}</Text>
        <Text style={tilStyle}>til</Text>
        <Heading as="h1" style={eventNameStyle}>
          {props.eventName}
        </Heading>
      </Section>

      <Hr style={dividerStyle} />

      <Text style={centeredBodyStyle}>
        Nååår{" "}
        <span style={nameHighlightStyle}>{props.name}</span> er du klar til dagens
        minigame.
      </Text>

      <Section style={buttonSectionStyle}>
        <Button href={props.gameUrl} style={buttonStyle}>
          Spil minigame
        </Button>
      </Section>
    </EmailLayout>
  );
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

const centeredBodyStyle = {
  ...bodyStyle,
  fontSize: "17px",
  margin: "0",
  textAlign: "center" as const,
};
