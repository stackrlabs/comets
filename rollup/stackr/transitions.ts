import { STF, Transitions } from "@stackr/sdk/machine";
import { hashMessage } from "ethers";
import { GameMode } from "../../client/game/gameMode";
import { World } from "../../client/game/world";
import { AppState } from "./machine";

export type CreateGame = {
  timestamp: number;
};

export type ValidateGameInput = {
  gameId: number;
  score: number;
  gameInputs: { v: string }[];
};

const startGame: STF<AppState, ValidateGameInput> = {
  handler: ({ state, msgSender, block, emit }) => {
    const gameId = hashMessage(
      `${msgSender}::${block.timestamp}::${Object.keys(state.games).length}`
    );

    state.games[gameId] = {
      id: gameId,
      score: 0,
      player: msgSender,
      isEnded: false,
    };

    emit({
      name: "GameCreated",
      value: gameId,
    });
    return state;
  },
};

const endGame: STF<AppState, ValidateGameInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const { gameInputs, gameId, score } = inputs;
    const { games } = state;
    if (!games[gameId]) {
      throw new Error("Game not found");
    }

    if (games[gameId].isEnded) {
      throw new Error("Game already ended");
    }

    if (games[gameId].player !== msgSender) {
      throw new Error("Unauthorized to end game");
    }

    const world = new World();
    const gameMode = new GameMode(world);
    for (const t of gameInputs) {
      gameMode.deserializeAndUpdate(1 / 60, t);
    }

    if (world.score !== score) {
      throw new Error(`Failed to replay: ${world.score} !== ${score}`);
    }

    games[gameId].score = score;
    games[gameId].isEnded = true;

    return state;
  },
};

export const transitions: Transitions<AppState> = {
  startGame,
  endGame,
};
