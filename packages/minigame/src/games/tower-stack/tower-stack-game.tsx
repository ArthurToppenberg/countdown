"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import type { MinigamePlayMode } from "../../types";
import {
  dropTowerStackBlock,
  resetTowerStack,
  settleTowerStackBlock,
} from "./actions";
import { TOWER_STACK_COPY } from "./copy";
import {
  getFallingBlockCenterY,
  getOscillatingCenter,
  isFallComplete,
} from "./logic";
import {
  TOWER_STACK_BLOCK_HEIGHT,
  TOWER_STACK_BOARD_HEIGHT,
  TOWER_STACK_BOARD_WIDTH,
  TOWER_STACK_FOUNDATION_HEIGHT,
  TOWER_STACK_FIRST_BLOCK_WIDTH,
  TOWER_STACK_SPAWN_Y,
  type TowerStackActions,
  type TowerStackBlock,
  type TowerStackPublicState,
} from "./types";

type TowerStackGameProps = {
  initialState: TowerStackPublicState;
  variant?: "standalone" | "embedded";
  mode?: MinigamePlayMode;
  actions?: TowerStackActions;
};

const defaultActions: TowerStackActions = {
  dropBlock: () => dropTowerStackBlock(),
  settleBlock: () => settleTowerStackBlock(),
  reset: () => resetTowerStack(),
};

export const TowerStackGame = ({
  initialState,
  variant = "standalone",
  mode = "practice",
  actions: actionsProp,
}: TowerStackGameProps) => {
  const actions = actionsProp ?? defaultActions;
  const isCompetitive = mode === "competitive";
  const [state, setState] = useState(initialState);
  const [blockCenter, setBlockCenter] = useState(initialState.blockCenter);
  const [blockCenterY, setBlockCenterY] = useState(initialState.blockCenterY);
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [showMissOverlay, setShowMissOverlay] = useState(false);
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(
    initialState.phase === "ended",
  );
  const [isPending, startTransition] = useTransition();
  const settleRequestedRef = useRef(false);

  useEffect(() => {
    settleRequestedRef.current = false;
  }, [state.fallStartedAt]);

  useEffect(() => {
    if (state.phase !== "playing") {
      setBlockCenter(state.blockCenter);
      setBlockCenterY(state.blockCenterY);
      return;
    }

    if (state.blockPhase === "moving") {
      let frame = 0;

      const animate = (): void => {
        setBlockCenter(
          getOscillatingCenter(
            state.blockWidth,
            state.phaseOffset,
            state.anchorAt,
            state.speed,
            Date.now(),
          ),
        );
        setBlockCenterY(TOWER_STACK_SPAWN_Y);
        frame = window.requestAnimationFrame(animate);
      };

      frame = window.requestAnimationFrame(animate);

      return () => window.cancelAnimationFrame(frame);
    }

    if (
      state.blockPhase === "falling" &&
      state.lockedCenter !== null &&
      state.fallStartedAt !== null
    ) {
      let frame = 0;

      const animate = (): void => {
        const now = Date.now();
        const centerY = getFallingBlockCenterY(
          state.stack.length,
          state.fallStartedAt ?? now,
          now,
        );

        setBlockCenter(state.lockedCenter ?? state.blockCenter);
        setBlockCenterY(centerY);

        if (
          !settleRequestedRef.current &&
          isFallComplete(state.stack.length, state.fallStartedAt ?? now, now)
        ) {
          settleRequestedRef.current = true;
          startTransition(async () => {
            const wasPlaying = state.phase === "playing";
            const result = await actions.settleBlock();

            if (result.success && wasPlaying && result.state.lastDropMissed) {
              if (result.state.phase === "ended") {
                setShowGameOverOverlay(true);
              } else {
                setShowMissOverlay(true);
              }
            }

            setState(result.state);
          });
        }

        frame = window.requestAnimationFrame(animate);
      };

      frame = window.requestAnimationFrame(animate);

      return () => window.cancelAnimationFrame(frame);
    }

    return undefined;
  }, [
    actions,
    state.anchorAt,
    state.blockCenter,
    state.blockCenterY,
    state.blockPhase,
    state.blockWidth,
    state.fallStartedAt,
    state.lockedCenter,
    state.phase,
    state.phaseOffset,
    state.speed,
    state.stack.length,
  ]);

  const applyAction = (
    action: () => Promise<{
      success: boolean;
      state: TowerStackPublicState;
    }>,
  ): void => {
    startTransition(async () => {
      const result = await action();
      setState(result.state);
    });
  };

  const isPlaying = state.phase === "playing";
  const isEnded = state.phase === "ended";
  const isFalling = state.blockPhase === "falling";
  const canDrop =
    (state.phase === "ready" || (isPlaying && !isFalling)) &&
    !isEnded &&
    !isPending;

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
              {TOWER_STACK_COPY.title}
            </h1>
            <p className="text-[0.68rem] text-[#8fa3bf] md:text-sm">
              {TOWER_STACK_COPY.subtitle}
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-[#243044] bg-white/5 px-2 py-1 text-[0.65rem] text-[#8fa3bf] md:px-3 md:py-1.5 md:text-xs">
            {TOWER_STACK_COPY.attemptsBadge(state.attemptsRemaining)}
          </div>
        </div>
      </header>

      <div className="shrink-0 grid grid-cols-3 gap-1.5 pb-2 md:gap-3 md:pb-3">
        <Stat label={TOWER_STACK_COPY.statAttempts} value={String(state.attemptsRemaining)} />
        <Stat
          accent="gold"
          label={TOWER_STACK_COPY.statTotal}
          value={String(state.totalScore)}
        />
        <Stat label={TOWER_STACK_COPY.statTower} value={String(state.attemptScore)} />
      </div>

      <section className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#243044] bg-[#121923] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <TowerBoard
          activeBlockCenter={blockCenter}
          activeBlockCenterY={blockCenterY}
          activeBlockWidth={state.blockWidth}
          isPlaying={isPlaying}
          stack={state.stack}
        />
      </section>

      <footer className="shrink-0 pt-2 md:pt-3">
        <button
          className="w-full rounded-xl bg-gradient-to-br from-[#1e4bd2] to-[#4f7cff] px-3 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,75,210,0.28)] transition active:scale-[0.98] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 md:py-3.5 md:text-base"
          disabled={!canDrop}
          onClick={() => applyAction(actions.dropBlock)}
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
              {TOWER_STACK_COPY.missDescription(state.attemptScore)}
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

      {showGameOverOverlay ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#030712]/72 p-4">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#243044] bg-[#121923] p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:max-w-[400px] md:p-6">
            <h2 className="text-xl font-semibold md:text-2xl">
              {TOWER_STACK_COPY.gameOver}
            </h2>
            <p className="mt-2 mb-4 text-sm leading-relaxed text-[#8fa3bf] md:text-base">
              {isCompetitive
                ? TOWER_STACK_COPY.competitiveGameOverDescription(state.totalScore)
                : TOWER_STACK_COPY.gameOverDescription(state.totalScore)}
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
                onClick={() => {
                  applyAction(actions.reset);
                  setShowGameOverOverlay(false);
                }}
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

type StatProps = {
  label: string;
  value: string;
  accent?: "gold";
};

const Stat = ({ label, value, accent }: StatProps) => (
  <div className="rounded-lg border border-[#243044] bg-[#121923] px-1.5 py-1.5 text-center md:rounded-xl md:px-3 md:py-2.5">
    <div className="text-[0.58rem] uppercase tracking-wide text-[#8fa3bf] md:text-[0.7rem]">
      {label}
    </div>
    <div
      className={`truncate text-[0.8rem] font-bold tabular-nums md:text-base ${
        accent === "gold" ? "text-[#ffd166]" : "text-[#e8eef7]"
      }`}
    >
      {value}
    </div>
  </div>
);

type TowerBoardProps = {
  stack: TowerStackBlock[];
  activeBlockCenter: number;
  activeBlockCenterY: number;
  activeBlockWidth: number;
  isPlaying: boolean;
};

const toPercentX = (center: number, width: number): { left: string; width: string } => ({
  left: `${((center - width / 2) / TOWER_STACK_BOARD_WIDTH) * 100}%`,
  width: `${(width / TOWER_STACK_BOARD_WIDTH) * 100}%`,
});

const toPercentBottom = (centerY: number): string =>
  `${((centerY - TOWER_STACK_BLOCK_HEIGHT / 2) / TOWER_STACK_BOARD_HEIGHT) * 100}%`;

const getStackBlockCenterY = (stackIndex: number): number =>
  TOWER_STACK_FOUNDATION_HEIGHT +
  stackIndex * TOWER_STACK_BLOCK_HEIGHT +
  TOWER_STACK_BLOCK_HEIGHT / 2;

const TowerBoard = ({
  stack,
  activeBlockCenter,
  activeBlockCenterY,
  activeBlockWidth,
  isPlaying,
}: TowerBoardProps) => {
  const maxVisibleBlocks = 10;
  const sliceStart = Math.max(0, stack.length - maxVisibleBlocks);
  const slicedStack = stack.slice(sliceStart);
  const stackOffset = sliceStart;

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
      <div className="relative mx-auto h-full w-full max-w-[280px]">
        <div className="absolute inset-x-0 bottom-0 top-[8%] overflow-hidden rounded-lg border border-[#243044]/80 bg-gradient-to-b from-[#1a2433] to-[#0f1724]">
          <div className="absolute inset-0">
            <div
              className="absolute bottom-0 rounded-sm bg-gradient-to-r from-[#5a6475] to-[#3d4654] shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
              style={{
                ...toPercentX(
                  TOWER_STACK_BOARD_WIDTH / 2,
                  TOWER_STACK_FIRST_BLOCK_WIDTH,
                ),
                height: `${(TOWER_STACK_FOUNDATION_HEIGHT / TOWER_STACK_BOARD_HEIGHT) * 100}%`,
              }}
            />
            {slicedStack.map((block, index) => {
              const stackIndex = stackOffset + index;
              const centerY = getStackBlockCenterY(stackIndex);
              const position = toPercentX(block.center, block.width);

              return (
                <div
                  className="absolute rounded-sm bg-gradient-to-r from-[#4f7cff] to-[#1e4bd2] shadow-[0_2px_8px_rgba(30,75,210,0.35)]"
                  key={`${block.center}-${block.width}-${stackIndex}`}
                  style={{
                    ...position,
                    bottom: toPercentBottom(centerY),
                    height: `${(TOWER_STACK_BLOCK_HEIGHT / TOWER_STACK_BOARD_HEIGHT) * 100}%`,
                  }}
                />
              );
            })}
            {isPlaying ? (
              <div
                className="absolute rounded-sm bg-gradient-to-r from-[#ffd166] to-[#f59e0b] shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
                style={{
                  ...toPercentX(activeBlockCenter, activeBlockWidth),
                  bottom: toPercentBottom(activeBlockCenterY),
                  height: `${(TOWER_STACK_BLOCK_HEIGHT / TOWER_STACK_BOARD_HEIGHT) * 100}%`,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
