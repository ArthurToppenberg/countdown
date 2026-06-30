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

const SEASON_NAME_GOLD = "#f59e0b";

export const getDagligEmailTitle = ({
  daysRemainingLabel,
  countdownNote,
}: DagligEmailEventProps): string => `${daysRemainingLabel} ${countdownNote}`;

export const getDagligEmailSubject = (props: DagligEmailEventProps): string =>
  getDagligEmailTitle(props);

type CountdownHeroProps = Pick<
  DagligEmailEventProps,
  "daysRemainingLabel" | "countdownNote" | "seasonName" | "eventName"
>;

const CountdownHero = ({
  daysRemainingLabel,
  countdownNote,
  seasonName,
  eventName,
}: CountdownHeroProps) => {
  const isNextSeasonCountdown =
    seasonName !== null && countdownNote === `til ${seasonName}`;
  const showEventContext = eventName.startsWith("når ");

  return (
    <>
      <Text style={countdownStyle}>{daysRemainingLabel}</Text>
      {isNextSeasonCountdown ? (
        <Text style={seasonNameLineStyle}>
          til{" "}
          <span style={seasonNameGoldStyle}>{seasonName}</span>
        </Text>
      ) : (
        <Text style={countdownNoteStyle}>{countdownNote}</Text>
      )}
      {seasonName && !isNextSeasonCountdown ? (
        <Text style={seasonNameOnlyStyle}>
          <span style={seasonNameGoldStyle}>{seasonName}</span>
        </Text>
      ) : null}
      {showEventContext ? (
        <Text style={eventContextStyle}>{eventName}</Text>
      ) : null}
    </>
  );
};

export const DagligEmail = (props: DagligEmailProps) => {
  const title = getDagligEmailTitle(props);

  return (
    <EmailLayout preview={title}>
      <Section style={heroStyle}>
        <CountdownHero
          countdownNote={props.countdownNote}
          daysRemainingLabel={props.daysRemainingLabel}
          eventName={props.eventName}
          seasonName={props.seasonName}
        />
      </Section>

      <Hr style={dividerStyle} />

      {props.leaderboard.length > 0 ? (
        <>
          <Section style={leaderboardSectionStyle}>
            <Heading as="h2" style={leaderboardTitleStyle}>
              Sæsonens stilling
            </Heading>
            <Text style={leaderboardDescriptionStyle}>
              Top 3 efter daglig placering
            </Text>
            {props.leaderboard.map((entry, index) => (
              <LeaderboardRow
                entry={entry}
                key={`leaderboard-${index + 1}`}
                rank={index + 1}
              />
            ))}
            {props.weeklyLeaderName ? (
              <Text style={weeklyLeaderStyle}>
                🥇 Ugens fører: {props.weeklyLeaderName}
              </Text>
            ) : null}
          </Section>
          <Hr style={leaderboardDividerStyle} />
        </>
      ) : null}

      {props.hasActiveGame ? (
        <>
          <Text style={centeredBodyStyle}>
            Nååår{" "}
            <span style={nameHighlightStyle}>{props.name}</span> er du klar til
            dagens game.
          </Text>

          <Section style={buttonSectionStyle}>
            <Button href={props.gameUrl} style={buttonStyle}>
              Spil game
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
  fontSize: "48px",
  fontWeight: "700",
  letterSpacing: "-0.04em",
  lineHeight: "1",
  margin: "0 0 12px",
};

const seasonNameLineStyle = {
  color: "#52525b",
  fontSize: "22px",
  fontWeight: "600",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 8px",
};

const seasonNameGoldStyle = {
  color: SEASON_NAME_GOLD,
  fontWeight: "700",
};

const seasonNameOnlyStyle = {
  fontSize: "22px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 6px",
};

const countdownNoteStyle = {
  color: "#71717a",
  fontSize: "16px",
  fontWeight: "500",
  letterSpacing: "0.01em",
  lineHeight: "1.3",
  margin: "0 0 6px",
};

const eventContextStyle = {
  color: "#a1a1aa",
  fontSize: "13px",
  fontWeight: "500",
  lineHeight: "1.4",
  margin: "8px 0 0",
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
  fontSize: "18px",
  fontWeight: "500",
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

const weeklyLeaderStyle = {
  color: "#71717a",
  fontSize: "13px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "12px 0 0",
  textAlign: "center" as const,
};

const leaderboardTitleStyle = {
  color: "#18181b",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 4px",
  textAlign: "center" as const,
};

const leaderboardDescriptionStyle = {
  color: "#a1a1aa",
  fontSize: "12px",
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
