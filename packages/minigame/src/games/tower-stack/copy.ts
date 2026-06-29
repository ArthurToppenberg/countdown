import { TOWER_STACK_MAX_ATTEMPTS } from "./types";

export const TOWER_STACK_COPY = {
  title: "Tower Stack",
  subtitle: `${TOWER_STACK_MAX_ATTEMPTS} forsøg · stabl blokke oven på hinanden`,
  attemptsBadge: (remaining: number): string =>
    `${remaining}/${TOWER_STACK_MAX_ATTEMPTS} tilbage`,
  howToPlayTitle: "Sådan spiller du",
  howToPlay:
    "Byg tårnet ved at placere blokke præcist før de skæres til eller forsvinder i bunden, mens kameraet stiger.",
  gotIt: "Forstået",
  statAttempts: "Forsøg",
  statTotal: "Point",
  statTower: "Tårn",
  startAttempt: "Start tårn",
  dropBlock: "Slip blok",
  missTitle: "Miss!",
  missDescription: (blocks: number): string =>
    blocks > 0
      ? `Du stablede ${blocks} ${blocks === 1 ? "blok" : "blokke"} i dette forsøg.`
      : "Blokken faldt ved siden af — prøv igen.",
  missButton: "Næste forsøg",
  collapseTitle: "Tårnet kollapsede!",
  collapseDescription: (blocks: number): string =>
    blocks > 0
      ? `Fundamentet forsvandt under kanten. Du nåede ${blocks} ${blocks === 1 ? "blok" : "blokke"} i dette forsøg.`
      : "Fundamentet forsvandt under kanten, før du nåede at stable.",
  collapseButton: "Næste forsøg",
  gameOver: "Spil slut",
  gameOverDescription: (score: number): string =>
    `Du brugte alle ${TOWER_STACK_MAX_ATTEMPTS} forsøg og endte med ${score} point.`,
  playAgain: "Spil igen",
  competitiveGameOverDescription: (score: number): string =>
    `Du brugte alle ${TOWER_STACK_MAX_ATTEMPTS} forsøg og endte med ${score} point. Dit resultat er gemt — kom tilbage i morgen for et nyt forsøg.`,
  competitiveGameOverButton: "Tilbage til forsiden",
  gameOverNoAttempts: "Du har brugt alle dine forsøg.",
  cannotDropNow: "Du kan ikke slippe en blok lige nu.",
  cannotSettleNow: "Blokken er ikke klar til at lande endnu.",
  fallNotComplete: "Blokken er stadig på vej ned.",
} as const;
