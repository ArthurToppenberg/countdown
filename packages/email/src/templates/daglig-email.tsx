import {
  Button,
  Column,
  Heading,
  Hr,
  Row,
  Section,
  Text,
} from "@react-email/components";

import { type DagligEmailEventProps, type DagligEmailLeaderboardEntry } from "../types";
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

const formatPoints = (points: number): string =>
  new Intl.NumberFormat("da-DK").format(points);

const LEADERBOARD_MEDALS = ["🥇", "🥈", "🥉"] as const;

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

      {props.leaderboard.length > 0 ? (
        <>
          <Section style={leaderboardSectionStyle}>
            <Heading as="h2" style={leaderboardTitleStyle}>
              Top 3 pointtavle
            </Heading>
            <Text style={leaderboardDescriptionStyle}>
              Spillere med flest point i alt
            </Text>
            {props.leaderboard.map((entry, index) => (
              <LeaderboardRow
                entry={entry}
                key={`leaderboard-${index + 1}`}
                rank={index + 1}
              />
            ))}
          </Section>
          <Hr style={leaderboardDividerStyle} />
        </>
      ) : null}

      {props.hasActiveMinigame ? (
        <>
          <Text style={centeredBodyStyle}>
            Nååår{" "}
            <span style={nameHighlightStyle}>{props.name}</span> er du klar til
            dagens minigame.
          </Text>

          <Section style={buttonSectionStyle}>
            <Button href={props.gameUrl} style={buttonStyle}>
              Spil minigame
            </Button>
          </Section>
        </>
      ) : null}
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

const leaderboardDividerStyle = {
  borderColor: "#e4e4e7",
  borderTop: "1px solid #e4e4e7",
  margin: "24px 0 24px",
};

const centeredBodyStyle = {
  ...bodyStyle,
  fontSize: "17px",
  margin: "0",
  textAlign: "center" as const,
};

type LeaderboardRowProps = {
  entry: DagligEmailLeaderboardEntry;
  rank: number;
};

const LeaderboardRow = ({ entry, rank }: LeaderboardRowProps) => {
  const medal = LEADERBOARD_MEDALS[rank - 1] ?? String(rank);

  return (
    <Section style={leaderboardRowStyle}>
      <Row>
        <Column style={leaderboardRankColumnStyle}>
          <Text style={leaderboardRankStyle}>{medal}</Text>
        </Column>
        <Column style={leaderboardNameColumnStyle}>
          <Text style={leaderboardNameStyle}>{entry.name}</Text>
        </Column>
        <Column style={leaderboardPointsColumnStyle}>
          <Text style={leaderboardPointsStyle}>{formatPoints(entry.points)}</Text>
        </Column>
      </Row>
    </Section>
  );
};

const leaderboardSectionStyle = {
  margin: "0 0 24px",
};

const leaderboardTitleStyle = {
  color: "#18181b",
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 4px",
  textAlign: "center" as const,
};

const leaderboardDescriptionStyle = {
  color: "#71717a",
  fontSize: "13px",
  lineHeight: "1.4",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const leaderboardRowStyle = {
  backgroundColor: "#fafafa",
  border: "1px solid #e4e4e7",
  borderRadius: "10px",
  margin: "0 0 8px",
  padding: "10px 14px",
};

const leaderboardRankColumnStyle = {
  width: "32px",
};

const leaderboardNameColumnStyle = {
  width: "auto",
};

const leaderboardPointsColumnStyle = {
  textAlign: "right" as const,
  width: "72px",
};

const leaderboardRankStyle = {
  color: "#18181b",
  fontSize: "16px",
  lineHeight: "1.4",
  margin: "0",
};

const leaderboardNameStyle = {
  color: "#18181b",
  fontSize: "14px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0",
};

const leaderboardPointsStyle = {
  color: "#18181b",
  fontSize: "14px",
  fontWeight: "700",
  lineHeight: "1.4",
  margin: "0",
  textAlign: "right" as const,
};
