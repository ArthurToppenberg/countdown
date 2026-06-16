import {
  CROSS_THE_VODKA_REDBULL_ATTEMPT_STAKE,
  CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS,
} from "./types";

export const CROSS_THE_VODKA_REDBULL_COPY = {
  title: "Cross the Vodka Redbull",
  subtitle: `${CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS} forsøg · ${CROSS_THE_VODKA_REDBULL_ATTEMPT_STAKE} credits hver`,
  attemptsBadge: (remaining: number): string =>
    `${remaining}/${CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS} tilbage`,
  howToPlayTitle: "Sådan spiller du",
  howToPlay:
    "Kryds vejen ét skridt ad gangen, men hæv din gevinst før du crasher — du har fem forsøg med 100 credits hver.",
  gotIt: "Forstået",
  statTries: "Forsøg",
  statWinnings: "Gevinst",
  statMultiplier: "Mult.",
  statMultiplierDesktop: "Multiplikator",
  statPayout: "Udb.",
  statPayoutDesktop: "Udbetaling",
  takeStep: "Tag et skridt",
  cashOut: "Hæv",
  cashOutCelebrationTitle: "Du vandt!",
  cashOutCelebrationSubtitle: (credits: string): string =>
    `+${credits} credits`,
  cashOutCelebrationButton: "Fedt!",
  crashTurnTitle: "Crash!",
  crashTurnButton: "Fortsæt",
  gameOver: "Spil slut",
  gameOverDescription: (credits: string): string =>
    `Du brugte alle ${CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS} forsøg og endte med ${credits} credits.`,
  playAgain: "Spil igen",
  competitiveGameOverDescription: (credits: string): string =>
    `Du brugte alle ${CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS} forsøg og endte med ${credits} credits. Dit resultat er gemt — kom tilbage i morgen for et nyt forsøg.`,
  competitiveGameOverButton: "Tilbage til forsiden",
  laneStart: "Start",
  laneStartDesktop: "Start",
  laneLabel: (lane: number): string => `Bane ${lane}`,
  laneCleared: "Klarert",
  laneCrash: "CRASH!",
  gameOverNoAttempts: "Spil slut. Ingen forsøg tilbage.",
  cannotStepNow: "Du kan ikke tage et skridt lige nu.",
  crashOnLane: (lane: number, credits: string): string =>
    `Crash på bane ${lane}! Mistede ${credits} credits.`,
  maxLaneReached: (credits: string): string =>
    `Maksimal bane nået! Hævet ${credits} credits.`,
  attemptStarted: (credits: string): string =>
    `Forsøg startet med ${credits} credits.`,
  laneClearedMessage: (lane: number, multiplier: string): string =>
    `Bane ${lane} klaret. Multiplikator er nu ${multiplier}.`,
  takeStepBeforeCashOut: "Tag et skridt, før du kan hæve.",
  takeOneStepBeforeCashOut: "Tag mindst ét skridt, før du hæver.",
  cashedOut: (credits: string): string => `Hævet ${credits} credits.`,
  newGameStarted: `Nyt spil startet. Du har ${CROSS_THE_VODKA_REDBULL_MAX_ATTEMPTS} forsøg med ${CROSS_THE_VODKA_REDBULL_ATTEMPT_STAKE} credits hver.`,
} as const;

export const formatAttemptsRemainingMessage = (
  attemptsRemaining: number,
  isGameOver: boolean,
): string => {
  if (isGameOver) {
    return "Ingen forsøg tilbage. Spil slut.";
  }

  if (attemptsRemaining === 1) {
    return "1 forsøg tilbage.";
  }

  return `${attemptsRemaining} forsøg tilbage.`;
};
