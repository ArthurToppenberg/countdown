"use client";

import { useEffect, useState, useTransition } from "react";

import { CROSS_THE_VODKA_REDBULL_COPY, formatAttemptsRemainingMessage } from "./copy";
import {
  cashOutCrossTheVodkaRedbull,
  resetCrossTheVodkaRedbull,
  takeCrossTheVodkaRedbullStep,
} from "./actions";
import {
  CROSS_THE_VODKA_REDBULL_TOTAL_LANES,
  type CrossTheVodkaRedbullActions,
  type CrossTheVodkaRedbullPublicState,
} from "./types";
import { formatCredits, getMultiplier } from "./logic";
import type { MinigamePlayMode } from "../../types";

type CrossTheVodkaRedbullGameProps = {
  initialState: CrossTheVodkaRedbullPublicState;
  variant?: "standalone" | "embedded";
  mode?: MinigamePlayMode;
  actions?: CrossTheVodkaRedbullActions;
};

const defaultActions: CrossTheVodkaRedbullActions = {
  takeStep: () => takeCrossTheVodkaRedbullStep(),
  cashOut: () => cashOutCrossTheVodkaRedbull(),
  reset: () => resetCrossTheVodkaRedbull(),
};

const LANE_ROW_COUNT = CROSS_THE_VODKA_REDBULL_TOTAL_LANES + 1;

const HIGHWAY_CAR_COLORS = [
  "#e63946",
  "#f4f4f5",
  "#457b9d",
  "#1d1d1f",
  "#f4a261",
  "#2d6a4f",
] as const;

const LANES_AHEAD_WITHOUT_TRAFFIC = 2;

const CONFETTI_COLORS = [
  "#fbbf24",
  "#22c55e",
  "#3b82f6",
  "#ef4444",
  "#a855f7",
  "#f472b6",
  "#ffd166",
  "#4ade80",
] as const;

const CONFETTI_PIECE_COUNT = 52;

type TurnSummary = {
  kind: "win" | "crash";
  attemptsRemaining: number;
  payout?: number;
};

export const CrossTheVodkaRedbullGame = ({
  initialState,
  variant = "standalone",
  mode = "practice",
  actions: actionsProp,
}: CrossTheVodkaRedbullGameProps) => {
  const actions = actionsProp ?? defaultActions;
  const isCompetitive = mode === "competitive";
  const [state, setState] = useState(initialState);
  const [isShaking, setIsShaking] = useState(false);
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(
    initialState.phase === "ended",
  );
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [turnSummary, setTurnSummary] = useState<TurnSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.crashLane === null) {
      return;
    }

    setIsShaking(true);
    const timeout = window.setTimeout(() => setIsShaking(false), 600);

    return () => window.clearTimeout(timeout);
  }, [state.crashLane]);

  useEffect(() => {
    if (state.phase === "ended" && turnSummary === null) {
      setShowGameOverOverlay(true);
    }
  }, [state.phase, turnSummary]);

  const applyAction = (
    action: () => Promise<{
      success: boolean;
      state: CrossTheVodkaRedbullPublicState;
    }>,
  ): void => {
    startTransition(async () => {
      const bankrollBefore = state.bankroll;
      const wasPlaying = state.phase === "playing";
      const result = await action();

      if (result.success) {
        const turnEnded = wasPlaying && result.state.phase !== "playing";
        const won = result.state.bankroll - bankrollBefore;

        if (turnEnded) {
          if (result.state.crashLane !== null) {
            setTurnSummary({
              kind: "crash",
              attemptsRemaining: result.state.attemptsRemaining,
            });
          } else if (won > 0) {
            setTurnSummary({
              kind: "win",
              attemptsRemaining: result.state.attemptsRemaining,
              payout: won,
            });
          }
        }
      }

      setState(result.state);
    });
  };

  const dismissTurnSummary = (): void => {
    const isLastAttempt = turnSummary?.attemptsRemaining === 0;
    setTurnSummary(null);

    if (isLastAttempt) {
      setShowGameOverOverlay(true);
    }
  };

  const isPlaying = state.phase === "playing";
  const isEnded = state.phase === "ended";
  const canStep = !isEnded && !isPending;
  const canCashOut = isPlaying && state.lane > 0 && !isPending;
  const potentialPayout =
    state.bet !== null ? Math.round(state.bet * state.multiplier) : null;
  const multiplierLabel =
    isPlaying && state.multiplier > 0
      ? `x${state.multiplier.toFixed(2)}`
      : "—";
  const payoutLabel =
    potentialPayout !== null ? formatCredits(potentialPayout) : "—";

  const shellClassName =
    variant === "standalone"
      ? "h-dvh w-full max-w-[440px] md:h-[min(92dvh,780px)] md:rounded-2xl md:border md:border-[#243044] md:shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      : "h-full w-full max-w-[440px]";

  const game = (
    <div
      className={`flex flex-col overflow-hidden bg-[#0b0f14] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[#e8eef7] md:px-5 md:py-5 ${shellClassName}`}
    >
      <header className="shrink-0 pb-2 md:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight md:text-xl">
              {CROSS_THE_VODKA_REDBULL_COPY.title}
            </h1>
            <p className="text-[0.68rem] text-[#8fa3bf] md:text-sm">
              {CROSS_THE_VODKA_REDBULL_COPY.subtitle}
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-[#243044] bg-white/5 px-2 py-1 text-[0.65rem] text-[#8fa3bf] md:px-3 md:py-1.5 md:text-xs">
            {CROSS_THE_VODKA_REDBULL_COPY.attemptsBadge(state.attemptsRemaining)}
          </div>
        </div>
      </header>

      <div className="shrink-0 grid grid-cols-4 gap-1.5 pb-2 md:gap-3 md:pb-3">
        <CompactStat
          accent="success"
          label={CROSS_THE_VODKA_REDBULL_COPY.statTries}
          labelDesktop={CROSS_THE_VODKA_REDBULL_COPY.statTries}
          value={String(state.attemptsRemaining)}
        />
        <CompactStat
          accent="gold"
          label={CROSS_THE_VODKA_REDBULL_COPY.statWinnings}
          labelDesktop={CROSS_THE_VODKA_REDBULL_COPY.statWinnings}
          value={formatCredits(state.bankroll)}
        />
        <CompactStat
          accent="gold"
          label={CROSS_THE_VODKA_REDBULL_COPY.statMultiplier}
          labelDesktop={CROSS_THE_VODKA_REDBULL_COPY.statMultiplierDesktop}
          value={multiplierLabel}
        />
        <CompactStat
          accent="gold"
          label={CROSS_THE_VODKA_REDBULL_COPY.statPayout}
          labelDesktop={CROSS_THE_VODKA_REDBULL_COPY.statPayoutDesktop}
          value={payoutLabel}
        />
      </div>

      <section className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[#243044] bg-[#121923] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:max-h-[540px] md:p-3">
        <div
          className={`grid h-full gap-0.5 md:gap-1.5 ${isShaking ? "ctv-shake" : ""}`}
          style={{
            gridTemplateRows: `repeat(${LANE_ROW_COUNT}, minmax(0, 1fr))`,
          }}
        >
          {Array.from(
            { length: CROSS_THE_VODKA_REDBULL_TOTAL_LANES },
            (_, index) => CROSS_THE_VODKA_REDBULL_TOTAL_LANES - index,
          ).map((lane) => (
            <LaneRow
              crashLane={state.crashLane}
              currentLane={state.lane}
              isPlaying={isPlaying}
              key={lane}
              lane={lane}
            />
          ))}
          <LaneRow
            crashLane={state.crashLane}
            currentLane={state.lane}
            isPlaying={isPlaying}
            lane={0}
            safetyZone
          />
        </div>
      </section>

      <footer className="shrink-0 pt-2 md:pt-3">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <button
            className="rounded-xl bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] px-3 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,75,210,0.28)] transition active:scale-[0.98] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 md:py-3.5 md:text-base"
            disabled={!canStep}
            onClick={() => applyAction(actions.takeStep)}
            type="button"
          >
            {CROSS_THE_VODKA_REDBULL_COPY.takeStep}
          </button>
          <button
            className="rounded-xl bg-gradient-to-br from-[#16a34a] to-[#22c55e] px-3 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.25)] transition active:scale-[0.98] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 md:py-3.5 md:text-base"
            disabled={!canCashOut}
            onClick={() => applyAction(actions.cashOut)}
            type="button"
          >
            {CROSS_THE_VODKA_REDBULL_COPY.cashOut}
          </button>
        </div>
      </footer>

      {turnSummary ? (
        <TurnSummaryOverlay onDismiss={dismissTurnSummary} summary={turnSummary} />
      ) : null}

      {showIntroOverlay ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#030712]/80 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#243044] bg-[#121923] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:max-w-[400px] md:p-6">
            <h2 className="text-xl font-semibold md:text-2xl">
              {CROSS_THE_VODKA_REDBULL_COPY.howToPlayTitle}
            </h2>
            <p className="mt-3 mb-5 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
              {CROSS_THE_VODKA_REDBULL_COPY.howToPlay}
            </p>
            <button
              className="w-full rounded-xl bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,75,210,0.28)] md:text-base"
              onClick={() => setShowIntroOverlay(false)}
              type="button"
            >
              {CROSS_THE_VODKA_REDBULL_COPY.gotIt}
            </button>
          </div>
        </div>
      ) : null}

      {showGameOverOverlay ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#030712]/72 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#243044] bg-[#121923] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:max-w-[400px] md:p-6">
            <h2 className="text-xl font-semibold md:text-2xl">
              {CROSS_THE_VODKA_REDBULL_COPY.gameOver}
            </h2>
            <p className="mt-2 mb-4 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
              {isCompetitive
                ? CROSS_THE_VODKA_REDBULL_COPY.competitiveGameOverDescription(
                    formatCredits(state.bankroll),
                  )
                : CROSS_THE_VODKA_REDBULL_COPY.gameOverDescription(
                    formatCredits(state.bankroll),
                  )}
            </p>
            {isCompetitive ? (
              <a
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#e10600] to-[#ff4d4d] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,6,0,0.28)] md:text-base"
                href="/"
              >
                {CROSS_THE_VODKA_REDBULL_COPY.competitiveGameOverButton}
              </a>
            ) : (
              <button
                className="w-full rounded-xl bg-gradient-to-br from-[#e10600] to-[#ff4d4d] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,6,0,0.28)] md:text-base"
                disabled={isPending}
                onClick={() => {
                  applyAction(actions.reset);
                  setShowGameOverOverlay(false);
                }}
                type="button"
              >
                {CROSS_THE_VODKA_REDBULL_COPY.playAgain}
              </button>
            )}
          </div>
        </div>
      ) : null}

      <GameStyles />
    </div>
  );

  if (variant === "standalone") {
    return (
      <div className="flex h-dvh justify-center bg-[#0b0f14] md:items-center md:p-6">
        {game}
      </div>
    );
  }

  return (
    <div className="flex h-full justify-center bg-[#0b0f14]">
      {game}
    </div>
  );
};

type TurnSummaryOverlayProps = {
  summary: TurnSummary;
  onDismiss: () => void;
};

const TurnSummaryOverlay = ({
  summary,
  onDismiss,
}: TurnSummaryOverlayProps) => {
  const isWin = summary.kind === "win";

  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 3200);

    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  const attemptsMessage = formatAttemptsRemainingMessage(
    summary.attemptsRemaining,
    summary.attemptsRemaining === 0,
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        aria-label={
          isWin
            ? CROSS_THE_VODKA_REDBULL_COPY.cashOutCelebrationButton
            : CROSS_THE_VODKA_REDBULL_COPY.crashTurnButton
        }
        className="absolute inset-0 bg-[#030712]/65"
        onClick={onDismiss}
        type="button"
      />
      {isWin ? <ConfettiBurst /> : null}
      <div
        className={`ctv-celebration-pop relative w-full max-w-[340px] rounded-2xl border bg-[#121923] p-6 text-center shadow-[0_16px_48px_rgba(0,0,0,0.55)] md:max-w-[380px] ${
          isWin ? "border-[#ffd166]/35" : "border-red-400/35"
        }`}
      >
        <div className="mb-2 text-4xl">{isWin ? "🎉" : "💥"}</div>
        <h2
          className={`text-2xl font-bold md:text-3xl ${
            isWin ? "text-[#ffd166]" : "text-red-300"
          }`}
        >
          {isWin
            ? CROSS_THE_VODKA_REDBULL_COPY.cashOutCelebrationTitle
            : CROSS_THE_VODKA_REDBULL_COPY.crashTurnTitle}
        </h2>
        {isWin && summary.payout !== undefined ? (
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#22c55e] md:text-4xl">
            {CROSS_THE_VODKA_REDBULL_COPY.cashOutCelebrationSubtitle(
              formatCredits(summary.payout),
            )}
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
          {attemptsMessage}
        </p>
        <button
          className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold text-white md:text-base ${
            isWin
              ? "bg-gradient-to-br from-[#16a34a] to-[#22c55e] shadow-[0_10px_24px_rgba(34,197,94,0.3)]"
              : "bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] shadow-[0_10px_24px_rgba(30,75,210,0.28)]"
          }`}
          onClick={onDismiss}
          type="button"
        >
          {isWin
            ? CROSS_THE_VODKA_REDBULL_COPY.cashOutCelebrationButton
            : CROSS_THE_VODKA_REDBULL_COPY.crashTurnButton}
        </button>
      </div>
    </div>
  );
};

const ConfettiBurst = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: CONFETTI_PIECE_COUNT }, (_, index) => (
      <span
        className="ctv-confetti"
        key={index}
        style={{
          left: `${(index * 19 + 5) % 100}%`,
          ["--ctv-confetti-color" as string]:
            CONFETTI_COLORS[index % CONFETTI_COLORS.length],
          ["--ctv-confetti-delay" as string]: `${(index % 14) * 0.07}s`,
          ["--ctv-confetti-duration" as string]: `${2.1 + (index % 6) * 0.28}s`,
          ["--ctv-confetti-drift" as string]: `${((index % 7) - 3) * 14}px`,
          ["--ctv-confetti-rotate" as string]: `${(index * 53) % 360}deg`,
        }}
      />
    ))}
  </div>
);

type CompactStatProps = {
  label: string;
  labelDesktop: string;
  value: string;
  accent?: "success" | "gold";
};

const CompactStat = ({
  label,
  labelDesktop,
  value,
  accent,
}: CompactStatProps) => {
  const valueClassName =
    accent === "success"
      ? "text-[#22c55e]"
      : accent === "gold"
        ? "text-[#ffd166]"
        : "text-[#e8eef7]";

  return (
    <div className="rounded-lg border border-[#243044] bg-[#121923] px-1.5 py-1.5 text-center md:rounded-xl md:px-3 md:py-2.5">
      <div className="text-[0.58rem] uppercase tracking-wide text-[#8fa3bf] md:text-[0.7rem]">
        <span className="md:hidden">{label}</span>
        <span className="hidden md:inline">{labelDesktop}</span>
      </div>
      <div
        className={`truncate text-[0.8rem] font-bold tabular-nums md:text-base ${valueClassName}`}
      >
        {value}
      </div>
    </div>
  );
};

type LaneRowProps = {
  lane: number;
  currentLane: number;
  isPlaying: boolean;
  crashLane: number | null;
  safetyZone?: boolean;
};

const LaneRow = ({
  lane,
  currentLane,
  isPlaying,
  crashLane,
  safetyZone = false,
}: LaneRowProps) => {
  const isCrash = crashLane === lane;
  const isActive = isPlaying && currentLane === lane;
  const isDone = currentLane > lane;

  const laneClassName = isCrash
    ? "border-red-400/55 bg-gradient-to-r from-red-500/25 to-red-950/55"
    : isActive
      ? "border-blue-400/45 bg-gradient-to-r from-blue-500/18 to-[#243044] shadow-[inset_0_0_0_1px_rgba(96,165,250,0.15)]"
      : isDone
        ? "border-green-500/35 bg-gradient-to-r from-green-500/18 to-[#14532d]"
        : "border-white/5 bg-[#1a2433]";

  const statusTextMobile = safetyZone
    ? CROSS_THE_VODKA_REDBULL_COPY.laneStart
    : isCrash
      ? "!"
      : isDone
        ? "✓"
        : `x${getMultiplier(lane).toFixed(1)}`;

  const statusTextDesktop = safetyZone
    ? CROSS_THE_VODKA_REDBULL_COPY.laneStartDesktop
    : isCrash
      ? CROSS_THE_VODKA_REDBULL_COPY.laneCrash
      : isDone
        ? CROSS_THE_VODKA_REDBULL_COPY.laneCleared
        : `x${getMultiplier(lane).toFixed(2)}`;

  const showTraffic =
    !safetyZone &&
    !isCrash &&
    lane > currentLane + LANES_AHEAD_WITHOUT_TRAFFIC;

  return (
    <div
      className={`relative flex min-h-0 max-h-[52px] items-center justify-between overflow-hidden rounded-md border px-1.5 md:max-h-none md:rounded-lg md:px-3 ${laneClassName}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_12px,rgba(255,255,255,0.08)_12px_18px)] opacity-30 md:opacity-35" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {isDone ? (
          <div className="absolute inset-0 z-[1] flex items-end justify-center gap-[14%] px-[8%] pb-0.5 sm:gap-[18%] sm:px-[12%]">
            <TrafficCone />
            <TrafficCone />
            <TrafficCone />
          </div>
        ) : null}
        {showTraffic ? (
          <>
            <HighwayCar
              color={HIGHWAY_CAR_COLORS[lane % HIGHWAY_CAR_COLORS.length]}
              delay={(lane % 5) * 0.55}
              duration={2.4 + (lane % 4) * 0.45}
              reverse={lane % 2 === 0}
            />
            <HighwayCar
              color={
                HIGHWAY_CAR_COLORS[(lane + 2) % HIGHWAY_CAR_COLORS.length]
              }
              delay={(lane % 5) * 0.55 + 1.35}
              duration={2.9 + (lane % 3) * 0.6}
              reverse={lane % 2 === 0}
              secondary
            />
          </>
        ) : null}
        {isCrash ? (
          <HighwayCar
            crashed
            color={HIGHWAY_CAR_COLORS[(lane + 1) % HIGHWAY_CAR_COLORS.length]}
            delay={0}
            duration={0}
            reverse={lane % 2 === 0}
          />
        ) : null}
      </div>
      <div className="relative z-[1] w-5 shrink-0 text-[0.62rem] font-semibold text-[#8fa3bf] md:w-16 md:text-xs">
        <span className="md:hidden">{safetyZone ? "0" : lane}</span>
        <span className="hidden md:inline">
          {safetyZone
            ? CROSS_THE_VODKA_REDBULL_COPY.laneStartDesktop
            : CROSS_THE_VODKA_REDBULL_COPY.laneLabel(lane)}
        </span>
      </div>
      <div className="relative z-[2] flex min-h-0 flex-1 items-center justify-center">
        {isCrash ? (
          <span className="ctv-pop relative z-[3] text-base leading-none md:text-2xl">
            💥
          </span>
        ) : isActive ? (
          <span className="ctv-bounce text-base leading-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] md:text-2xl">
            🥤
          </span>
        ) : null}
      </div>
      <div className="relative z-[1] w-7 shrink-0 text-right text-[0.62rem] font-medium text-[#8fa3bf] md:w-20 md:text-xs">
        <span className="md:hidden">{statusTextMobile}</span>
        <span className="hidden md:inline">{statusTextDesktop}</span>
      </div>
    </div>
  );
};

const TrafficCone = () => (
  <div className="ctv-traffic-cone">
    <div className="ctv-traffic-cone-body">
      <div className="ctv-traffic-cone-stripe" />
    </div>
    <div className="ctv-traffic-cone-base" />
  </div>
);

type HighwayCarProps = {
  color: string;
  delay: number;
  duration: number;
  reverse?: boolean;
  crashed?: boolean;
  secondary?: boolean;
};

const HighwayCar = ({
  color,
  delay,
  duration,
  reverse = false,
  crashed = false,
  secondary = false,
}: HighwayCarProps) => {
  const className = [
    "ctv-highway-car pointer-events-none absolute top-1/2 z-0 -translate-y-1/2",
    reverse ? "ctv-highway-car--reverse" : "",
    crashed ? "ctv-highway-car--crashed" : "",
    secondary ? "ctv-highway-car--secondary hidden sm:block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{
        ["--ctv-car-delay" as string]: `${delay}s`,
        ["--ctv-car-duration" as string]: `${duration}s`,
      }}
    >
      <div className="ctv-highway-car-body" style={{ backgroundColor: color }}>
        <div className="ctv-highway-car-roof" />
        <div className="ctv-highway-car-glass ctv-highway-car-glass--front" />
        <div className="ctv-highway-car-glass ctv-highway-car-glass--rear" />
        <div className="ctv-highway-car-headlight ctv-highway-car-headlight--left" />
        <div className="ctv-highway-car-headlight ctv-highway-car-headlight--right" />
      </div>
    </div>
  );
};

const GameStyles = () => (
  <style>{`
    .ctv-shake {
      animation: ctv-shake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }
    .ctv-bounce {
      animation: ctv-bounce 0.35s ease;
    }
    .ctv-pop {
      animation: ctv-pop 0.45s ease;
    }
    .ctv-celebration-pop {
      animation: ctv-celebration-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .ctv-confetti {
      position: absolute;
      top: -8%;
      width: 8px;
      height: 12px;
      border-radius: 2px;
      background: var(--ctv-confetti-color, #fbbf24);
      opacity: 0;
      animation: ctv-confetti-fall var(--ctv-confetti-duration, 2.5s) ease-in forwards;
      animation-delay: var(--ctv-confetti-delay, 0s);
    }
    @keyframes ctv-celebration-pop {
      0% { transform: scale(0.82); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes ctv-confetti-fall {
      0% {
        opacity: 1;
        transform: translate3d(0, 0, 0) rotate(0deg);
      }
      100% {
        opacity: 0;
        transform: translate3d(var(--ctv-confetti-drift, 0), 110vh, 0)
          rotate(var(--ctv-confetti-rotate, 180deg));
      }
    }
    .ctv-traffic-cone {
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
    }
    .ctv-traffic-cone-body {
      position: relative;
      width: 9px;
      height: 11px;
      background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%);
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    }
    .ctv-traffic-cone-stripe {
      position: absolute;
      top: 42%;
      left: 18%;
      right: 18%;
      height: 2px;
      border-radius: 1px;
      background: rgba(255, 255, 255, 0.92);
    }
    .ctv-traffic-cone-base {
      width: 11px;
      height: 2px;
      margin-top: 1px;
      border-radius: 1px;
      background: #374151;
    }
    @media (min-width: 640px) {
      .ctv-traffic-cone-body {
        width: 11px;
        height: 14px;
      }
      .ctv-traffic-cone-base {
        width: 13px;
        height: 3px;
      }
    }
    .ctv-highway-car {
      top: 50%;
      width: 26px;
      height: 12px;
      transform: translateY(-50%);
      animation: ctv-car-drive var(--ctv-car-duration, 3s) linear infinite;
      animation-delay: var(--ctv-car-delay, 0s);
      will-change: left;
    }
    .ctv-highway-car--secondary {
      width: 22px;
      height: 10px;
      opacity: 0.85;
    }
    .ctv-highway-car--reverse {
      animation-name: ctv-car-drive-reverse;
    }
    .ctv-highway-car--crashed {
      left: 50%;
      animation: none;
      transform: translate(-50%, -50%);
      z-index: 2;
    }
    .ctv-highway-car-body {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 3px;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.22) inset,
        0 2px 6px rgba(0, 0, 0, 0.45);
    }
    .ctv-highway-car-roof {
      position: absolute;
      top: 2px;
      left: 22%;
      width: 56%;
      height: 5px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.28);
    }
    .ctv-highway-car-glass {
      position: absolute;
      top: 2px;
      width: 4px;
      height: 5px;
      border-radius: 1px;
      background: rgba(147, 197, 253, 0.75);
    }
    .ctv-highway-car-glass--front {
      left: 24%;
    }
    .ctv-highway-car-glass--rear {
      right: 24%;
    }
    .ctv-highway-car-headlight {
      position: absolute;
      bottom: 1px;
      width: 2px;
      height: 2px;
      border-radius: 50%;
      background: #fef08a;
      box-shadow: 0 0 3px #fef08a;
    }
    .ctv-highway-car-headlight--left {
      left: 3px;
    }
    .ctv-highway-car-headlight--right {
      right: 3px;
    }
    .ctv-highway-car--reverse .ctv-highway-car-headlight--left,
    .ctv-highway-car--reverse .ctv-highway-car-headlight--right {
      background: #f87171;
      box-shadow: 0 0 3px #f87171;
    }
    @media (min-width: 640px) {
      .ctv-highway-car {
        width: 34px;
        height: 15px;
      }
      .ctv-highway-car--secondary {
        width: 28px;
        height: 12px;
      }
      .ctv-highway-car-roof {
        height: 6px;
      }
      .ctv-highway-car-glass {
        width: 5px;
        height: 6px;
      }
    }
    @keyframes ctv-shake {
      10%, 90% { transform: translateX(-2px); }
      20%, 80% { transform: translateX(4px); }
      30%, 50%, 70% { transform: translateX(-8px); }
      40%, 60% { transform: translateX(8px); }
    }
    @keyframes ctv-bounce {
      0% { transform: translateY(4px) scale(0.92); }
      60% { transform: translateY(-3px) scale(1.05); }
      100% { transform: translateY(0) scale(1); }
    }
    @keyframes ctv-pop {
      0% { transform: scale(0.4); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes ctv-car-drive {
      0% { left: -12%; }
      100% { left: 112%; }
    }
    @keyframes ctv-car-drive-reverse {
      0% { left: 112%; }
      100% { left: -12%; }
    }
  `}</style>
);
