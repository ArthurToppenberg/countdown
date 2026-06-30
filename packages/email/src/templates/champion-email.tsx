import { Button, Heading, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  bodyStyle,
  buttonSectionStyle,
  buttonStyle,
  nameHighlightStyle,
} from "./email-styles";

export type ChampionEmailProps = {
  name: string;
  festivalName: string;
  leaguePoints: number;
  appUrl: string;
};

const formatPoints = (points: number): string =>
  new Intl.NumberFormat("da-DK").format(points);

export const getChampionEmailTitle = ({
  name,
  festivalName,
}: Pick<ChampionEmailProps, "name" | "festivalName">): string =>
  `👑 ${name} er ${festivalName}-mester`;

export const ChampionEmail = (props: ChampionEmailProps) => {
  const title = getChampionEmailTitle(props);

  return (
    <EmailLayout preview={title}>
      <Section style={heroStyle}>
        <Text style={crownStyle}>👑</Text>
        <Heading as="h1" style={titleStyle}>
          {props.festivalName}-mester
        </Heading>
        <Text style={championNameStyle}>{props.name}</Text>
        <Text style={pointsStyle}>{formatPoints(props.leaguePoints)} point</Text>
      </Section>

      <Text style={bodyStyle}>
        Sæsonen er slut, og{" "}
        <span style={nameHighlightStyle}>{props.name}</span> tog tronen. Tillykke
        med titlen — nu starter en ny sæson, og alle andre vil have revanche.
      </Text>

      <Section style={buttonSectionStyle}>
        <Button href={props.appUrl} style={buttonStyle}>
          Se stillingen
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

const crownStyle = {
  fontSize: "40px",
  lineHeight: "1",
  margin: "0 0 8px",
};

const titleStyle = {
  color: "#a1a1aa",
  fontSize: "14px",
  fontWeight: "500",
  letterSpacing: "0.04em",
  margin: "0 0 10px",
  textTransform: "uppercase" as const,
};

const championNameStyle = {
  color: "#18181b",
  fontSize: "26px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 6px",
};

const pointsStyle = {
  color: "#71717a",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};
