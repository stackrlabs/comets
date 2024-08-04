"use client";
import { useAction } from "@/app/useAction";
import { Comets } from "@/core/comets";
import { KeyManager } from "@/core/keys";
import { init } from "@/core/loop";
import { TickRecorder } from "@/core/tickRecorder";
import {
  addToStore,
  getFromStore,
  removeFromStore,
  StorageKey,
} from "@/rpc/storage";
import { useEffect, useRef } from "react";

const LOOP_INTERVAL = 1000;
export const Game = () => {
  const { submit } = useAction();
  const tickRecorder = useRef<TickRecorder>();
  const isStarting = useRef<boolean>(false);
  const isEnding = useRef<boolean>(false);
  const game = useRef<Comets>();

  const handleEndGame = async (score: number) => {
    if (isEnding.current) {
      return;
    }

    isEnding.current = true;
    try {
      await submit("endGame", {
        gameId: getFromStore(StorageKey.GAME_ID),
        timestamp: Date.now(),
        score,
        gameInputs: tickRecorder.current?.serializedTicks(),
      });
    } catch (e: unknown) {
      console.error("Error sending ticks", (e as Error).message);
    } finally {
      removeFromStore(StorageKey.GAME_ID);
      game.current?.switchToMainPage();
      isEnding.current = false;
    }
  };

  const handleStartGame = async () => {
    if (isStarting.current) {
      return;
    }

    isStarting.current = true;
    const res = await submit("startGame", {
      timestamp: Date.now(),
    });
    const gameId = res.logs[0].value;
    console.debug("Game started", gameId);
    addToStore(StorageKey.GAME_ID, gameId);
    isStarting.current = false;
    return gameId;
  };

  const createGame = () => {
    const km = new KeyManager();
    const tr = new TickRecorder(km);
    tickRecorder.current = tr;

    const comets = new Comets(km, tr, handleEndGame, handleStartGame);
    game.current = comets;
  };

  useEffect(() => {
    createGame();

    const tick = setTimeout(() => {
      if (game.current) {
        init(game.current);
      }
    }, LOOP_INTERVAL);

    return () => {
      if (tick) {
        clearTimeout(tick);
      }
    };
  }, []);

  return (
    <div id="game">
      <canvas id="canvas" className="border-4 rounded-sm"></canvas>
    </div>
  );
};
