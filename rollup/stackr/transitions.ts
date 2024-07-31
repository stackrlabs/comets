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
  keypresses: [
    { wasHyperspace: boolean },
    { isRotateLeft: boolean },
    { wasRotateLeft: boolean },
    { isRotateRight: boolean },
    { wasRotateRight: boolean },
    { isThrust: boolean },
    { isFire: boolean }
  ];
};

const createGame: STF<AppState, ValidateGameInput> = {
  handler: ({ state, msgSender, block, emit }) => {
    const gameId = hashMessage(
      `${msgSender}::${block.timestamp}::${state.games}`
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
    const { keypresses, gameId, score } = inputs;
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

    const world = new World(0);
    const gameMode = new GameMode(world);
    for (const kp of keypresses) {
      gameMode.update(1 / 60, kp);
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
  validateGame: endGame,
  createGame,
};
