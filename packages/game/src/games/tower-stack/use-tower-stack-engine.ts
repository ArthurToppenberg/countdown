"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  advanceTowerStackWorld,
  createDefaultSession,
  getOscillatingCenter,
  lockBlock,
  settleBlock,
  startAttempt,
  toPublicState,
} from "./logic";
import type {
  TowerStackFailureReason,
  TowerStackPublicState,
  TowerStackReplay,
  TowerStackSession,
} from "./types";

type TowerStackEngineCallbacks = {
  onAttemptFailed?: (reason: TowerStackFailureReason | null) => void;
  onGameEnded?: (score: number, replay: TowerStackReplay) => void;
};

type TowerStackEngine = {
  view: TowerStackPublicState;
  primaryAction: () => void;
  reset: () => void;
};

const createReplay = (): TowerStackReplay => ({ attempts: [] });

export const useTowerStackEngine = (
  callbacks: TowerStackEngineCallbacks,
): TowerStackEngine => {
  const sessionRef = useRef<TowerStackSession>(createDefaultSession());
  const replayRef = useRef<TowerStackReplay>(createReplay());
  const attemptStartRef = useRef<number>(0);
  const endedHandledRef = useRef<boolean>(false);
  const callbacksRef = useRef<TowerStackEngineCallbacks>(callbacks);
  callbacksRef.current = callbacks;

  const [view, setView] = useState<TowerStackPublicState>(() =>
    toPublicState(sessionRef.current, Date.now()),
  );

  // The whole simulation runs locally in a single animation loop while an
  // attempt is in progress. No server round-trips happen during play.
  useEffect(() => {
    if (view.phase !== "playing") {
      return undefined;
    }

    let frame = 0;

    const step = (): void => {
      const now = Date.now();
      const previous = sessionRef.current;
      const advanced = advanceTowerStackWorld(previous, now);
      const next = settleBlock(advanced, now);
      sessionRef.current = next;

      if (previous.phase === "playing" && next.phase === "ready") {
        callbacksRef.current.onAttemptFailed?.(next.lastFailureReason);
      } else if (previous.phase === "playing" && next.phase === "ended") {
        if (!endedHandledRef.current) {
          endedHandledRef.current = true;
          callbacksRef.current.onGameEnded?.(next.totalScore, replayRef.current);
        }
      }

      setView(toPublicState(next, now));
      frame = window.requestAnimationFrame(step);
    };

    frame = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frame);
  }, [view.phase]);

  const primaryAction = useCallback((): void => {
    const now = Date.now();
    const current = sessionRef.current;

    if (current.phase === "ready") {
      const next = startAttempt(current, now);
      replayRef.current.attempts.push({ placements: [] });
      attemptStartRef.current = now;
      sessionRef.current = next;
      setView(toPublicState(next, now));
      return;
    }

    if (current.phase === "playing" && current.blockPhase === "moving") {
      const lockedCenter = getOscillatingCenter(
        current.blockWidth,
        current.phaseOffset,
        current.anchorAt,
        current.speed,
        now,
      );
      const currentAttempt =
        replayRef.current.attempts[replayRef.current.attempts.length - 1];
      currentAttempt?.placements.push({
        lockedCenter,
        lockedAtMs: now - attemptStartRef.current,
      });

      const next = lockBlock(current, now);
      sessionRef.current = next;
      setView(toPublicState(next, now));
    }
  }, []);

  const reset = useCallback((): void => {
    const now = Date.now();
    const next = createDefaultSession();
    sessionRef.current = next;
    replayRef.current = createReplay();
    attemptStartRef.current = 0;
    endedHandledRef.current = false;
    setView(toPublicState(next, now));
  }, []);

  return { view, primaryAction, reset };
};
