"use client";

import { useState, useTransition } from "react";

import type { MinigamePlayMode } from "../../types";
import { TOWER_STACK_COPY } from "./copy";
import { getStackBlockCenterY } from "./logic";
import { useTowerStackEngine } from "./use-tower-stack-engine";
import {
  TOWER_STACK_BLOCK_HEIGHT,
  TOWER_STACK_BOARD_WIDTH,
  TOWER_STACK_FIRST_BLOCK_WIDTH,
  TOWER_STACK_FOUNDATION_HEIGHT,
  TOWER_STACK_MAX_ATTEMPTS,
  TOWER_STACK_VIEWPORT_HEIGHT,
  type TowerStackActions,
  type TowerStackBlock,
  type TowerStackFailureReason,
  type TowerStackPublicState,
  type TowerStackReplay,
} from "./types";

type TowerStackGameProps = {
  initialState: TowerStackPublicState;
  variant?: "standalone" | "embedded";
  mode?: MinigamePlayMode;
  actions?: TowerStackActions;
};

export const TowerStackGame = ({
  initialState,
  variant = "standalone",
  mode = "practice",
  actions,
}: TowerStackGameProps) => {
  const isCompetitive = mode === "competitive";
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [showMissOverlay, setShowMissOverlay] = useState(false);
  const [showCollapseOverlay, setShowCollapseOverlay] = useState(false);
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(
    initialState.phase === "ended",
  );
  const [isPending, startTransition] = useTransition();

  const handleAttemptFailed = (
    reason: TowerStackFailureReason | null,
  ): void => {
    if (reason === "collapse") {
      setShowCollapseOverlay(true);
      return;
    }

    setShowMissOverlay(true);
  };

  const handleGameEnded = (score: number, replay: TowerStackReplay): void => {
    setShowGameOverOverlay(true);

    if (!actions?.submitResult) {
      return;
    }

    startTransition(async () => {
      await actions.submitResult({ score, replay });
    });
  };

  const { view, primaryAction, reset } = useTowerStackEngine({
    onAttemptFailed: handleAttemptFailed,
    onGameEnded: handleGameEnded,
  });

  const isPlaying = view.phase === "playing";
  const isEnded = view.phase === "ended";
  const isFalling = view.blockPhase === "falling";
  const canDrop =
    (view.phase === "ready" || (isPlaying && !isFalling)) && !isEnded;

  const handlePlayAgain = (): void => {
    reset();
    setShowGameOverOverlay(false);
  };

  const shellClassName =
    variant === "standalone"
      ? "h-dvh w-full max-w-[440px] md:h-[min(92dvh,780px)] md:rounded-2xl md:border md:border-[#243044] md:shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      : "h-full w-full max-w-[440px]";

  const game = (
    <div
      className={`flex flex-col overflow-hidden bg-[#0b0f14] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[#e8eef7] md:px-5 md:py-5 ${shellClassName}`}
    >
      <section className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#243044] bg-[#121923] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <TowerBoard
          activeBlockCenter={view.blockCenter}
          activeBlockCenterY={view.blockCenterY}
          activeBlockWidth={view.blockWidth}
          attemptsRemaining={view.attemptsRemaining}
          cameraY={view.cameraY}
          isPlaying={isPlaying}
          score={view.totalScore}
          stack={view.stack}
          stackBaseIndex={view.stackBaseIndex}
        />
      </section>

      <footer className="shrink-0 pt-2 md:pt-3">
        <button
          className="w-full rounded-xl bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] px-3 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,75,210,0.28)] transition active:scale-[0.98] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 md:py-3.5 md:text-base"
          disabled={!canDrop}
          onClick={primaryAction}
          type="button"
        >
          {isPlaying ? TOWER_STACK_COPY.dropBlock : TOWER_STACK_COPY.startAttempt}
        </button>
      </footer>

      {showIntroOverlay ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#030712]/80 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#243044] bg-[#121923] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:max-w-[400px] md:p-6">
            <h2 className="text-xl font-semibold md:text-2xl">
              {TOWER_STACK_COPY.howToPlayTitle}
            </h2>
            <p className="mt-3 mb-5 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
              {TOWER_STACK_COPY.howToPlay}
            </p>
            <button
              className="w-full rounded-xl bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,75,210,0.28)] md:text-base"
              onClick={() => setShowIntroOverlay(false)}
              type="button"
            >
              {TOWER_STACK_COPY.gotIt}
            </button>
          </div>
        </div>
      ) : null}

      {showMissOverlay ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#030712]/72 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-red-400/35 bg-[#121923] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:max-w-[400px] md:p-6">
            <div className="mb-2 text-4xl">💥</div>
            <h2 className="text-xl font-semibold text-red-300 md:text-2xl">
              {TOWER_STACK_COPY.missTitle}
            </h2>
            <p className="mt-2 mb-4 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
              {TOWER_STACK_COPY.missDescription(view.attemptScore)}
            </p>
            <button
              className="w-full rounded-xl bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,75,210,0.28)] md:text-base"
              onClick={() => setShowMissOverlay(false)}
              type="button"
            >
              {TOWER_STACK_COPY.missButton}
            </button>
          </div>
        </div>
      ) : null}

      {showCollapseOverlay ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#030712]/72 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-amber-400/35 bg-[#121923] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:max-w-[400px] md:p-6">
            <div className="mb-2 text-4xl">📉</div>
            <h2 className="text-xl font-semibold text-amber-300 md:text-2xl">
              {TOWER_STACK_COPY.collapseTitle}
            </h2>
            <p className="mt-2 mb-4 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
              {TOWER_STACK_COPY.collapseDescription(view.attemptScore)}
            </p>
            <button
              className="w-full rounded-xl bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,75,210,0.28)] md:text-base"
              onClick={() => setShowCollapseOverlay(false)}
              type="button"
            >
              {TOWER_STACK_COPY.collapseButton}
            </button>
          </div>
        </div>
      ) : null}

      {showGameOverOverlay ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#030712]/72 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#243044] bg-[#121923] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:max-w-[400px] md:p-6">
            <h2 className="text-xl font-semibold md:text-2xl">
              {TOWER_STACK_COPY.gameOver}
            </h2>
            <p className="mt-2 mb-4 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
              {isCompetitive
                ? TOWER_STACK_COPY.competitiveGameOverDescription(view.totalScore)
                : TOWER_STACK_COPY.gameOverDescription(view.totalScore)}
            </p>
            {isCompetitive ? (
              <a
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#e10600] to-[#ff4d4d] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,6,0,0.28)] md:text-base"
                href="/"
              >
                {TOWER_STACK_COPY.competitiveGameOverButton}
              </a>
            ) : (
              <button
                className="w-full rounded-xl bg-gradient-to-br from-[#e10600] to-[#ff4d4d] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,6,0,0.28)] md:text-base"
                disabled={isPending}
                onClick={handlePlayAgain}
                type="button"
              >
                {TOWER_STACK_COPY.playAgain}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (variant === "standalone") {
    return (
      <div className="flex h-dvh justify-center bg-[#0b0f14] md:items-center md:p-6">
        {game}
      </div>
    );
  }

  return <div className="flex h-full justify-center bg-[#0b0f14]">{game}</div>;
};

type TowerBoardProps = {
  stack: TowerStackBlock[];
  stackBaseIndex: number;
  activeBlockCenter: number;
  activeBlockCenterY: number;
  activeBlockWidth: number;
  attemptsRemaining: number;
  cameraY: number;
  isPlaying: boolean;
  score: number;
};

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    aria-hidden
    className={
      filled
        ? "h-7 w-7 text-[#ff4d6d]/[0.22] md:h-9 md:w-9"
        : "h-7 w-7 text-[#8fa3bf]/[0.12] md:h-9 md:w-9"
    }
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    viewBox="0 0 24 24"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const toPercentX = (center: number, width: number): { left: string; width: string } => ({
  left: `${((center - width / 2) / TOWER_STACK_BOARD_WIDTH) * 100}%`,
  width: `${(width / TOWER_STACK_BOARD_WIDTH) * 100}%`,
});

const toViewportBottom = (worldBottomY: number, cameraY: number): string => {
  const screenBottomY =
    worldBottomY - cameraY + TOWER_STACK_VIEWPORT_HEIGHT / 2;

  return `${(screenBottomY / TOWER_STACK_VIEWPORT_HEIGHT) * 100}%`;
};

const TowerBoard = ({
  stack,
  stackBaseIndex,
  activeBlockCenter,
  activeBlockCenterY,
  activeBlockWidth,
  attemptsRemaining,
  cameraY,
  isPlaying,
  score,
}: TowerBoardProps) => (
  <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
    <div className="relative mx-auto h-full w-full max-w-[280px]">
      <div className="absolute inset-x-0 bottom-0 top-[8%] overflow-hidden rounded-lg border border-[#243044]/80 bg-gradient-to-b from-[#1a2433] to-[#0f1724]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-2 p-3 select-none md:gap-3 md:p-4"
        >
          {Array.from({ length: TOWER_STACK_MAX_ATTEMPTS }).map((_, index) => (
            <HeartIcon filled={index < attemptsRemaining} key={index} />
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <span className="text-[clamp(5rem,28vw,9rem)] font-black leading-none tracking-tighter text-[#ffd166]/[0.08] tabular-nums">
            {score}
          </span>
        </div>
        <div className="absolute inset-0">
          <div
            className="absolute bottom-0 rounded-sm bg-gradient-to-r from-[#5a6475] to-[#3d4654] shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
            style={{
              ...toPercentX(
                TOWER_STACK_BOARD_WIDTH / 2,
                TOWER_STACK_FIRST_BLOCK_WIDTH,
              ),
              bottom: toViewportBottom(0, cameraY),
              height: `${(TOWER_STACK_FOUNDATION_HEIGHT / TOWER_STACK_VIEWPORT_HEIGHT) * 100}%`,
            }}
          />
          {stack.map((block, index) => {
            const centerY = getStackBlockCenterY(stackBaseIndex, index);
            const position = toPercentX(block.center, block.width);

            return (
              <div
                className="absolute rounded-sm bg-gradient-to-r from-[#4f7cff] to-[#1e4bd2] shadow-[0_2px_8px_rgba(30,75,210,0.35)]"
                key={`${block.center}-${block.width}-${stackBaseIndex + index}`}
                style={{
                  ...position,
                  bottom: toViewportBottom(
                    centerY - TOWER_STACK_BLOCK_HEIGHT / 2,
                    cameraY,
                  ),
                  height: `${(TOWER_STACK_BLOCK_HEIGHT / TOWER_STACK_VIEWPORT_HEIGHT) * 100}%`,
                }}
              />
            );
          })}
          {isPlaying ? (
            <div
              className="absolute rounded-sm bg-gradient-to-r from-[#ffd166] to-[#f59e0b] shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
              style={{
                ...toPercentX(activeBlockCenter, activeBlockWidth),
                bottom: toViewportBottom(
                  activeBlockCenterY - TOWER_STACK_BLOCK_HEIGHT / 2,
                  cameraY,
                ),
                height: `${(TOWER_STACK_BLOCK_HEIGHT / TOWER_STACK_VIEWPORT_HEIGHT) * 100}%`,
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  </div>
);
