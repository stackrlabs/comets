import { REQUIRE, STF, Transitions } from "@stackr/sdk/machine";
import { hashMessage } from "ethers";
import { ACTIONS, GameMode } from "../../client/game/gameMode";
import { World } from "../../client/game/world";
import { AppState } from "./machine";

export type StartGameInput = {
  timestamp: number;
};

export type EndGameInput = {
  gameId: string;
  timestamp: number;
  score: number;
  gameInputs: string;
};

const startGame: STF<AppState, StartGameInput> = {
  handler: ({ state, msgSender, block, emit }) => {
    const gameId = hashMessage(
      `${msgSender}::${block.timestamp}::${Object.keys(state.games).length}`
    );

    state.games[gameId] = {
      score: 0,
      player: String(msgSender),
    };

    emit({
      name: "GameCreated",
      value: gameId,
    });
    return state;
  },
};

const endGame: STF<AppState, EndGameInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const { gameInputs, gameId, score } = inputs;
    const { games } = state;
    // validation checks
    REQUIRE(!!games[gameId], "GAME_NOT_FOUND");
    REQUIRE(games[gameId].score === 0, "GAME_ALREADY_ENDED");
    REQUIRE(games[gameId].player === String(msgSender), "UNAUTHORIZED");
    // rerun game loop
    const world = new World();
    const gameMode = new GameMode(world, { gameId });
    const ticks = gameInputs
      .split(",")
      .map((tick) => Number(tick).toString(2).padStart(ACTIONS.length, "0"));

    for (let i = 0; i < ticks.length; i++) {
      gameMode.deserializeAndUpdate(1 / 60, ticks[i]);
    }

    REQUIRE(
      world.score === score,
      `FAILED_TO_REPLAY: ${world.score} !== ${score}`
    );

    games[gameId].score = score;

    return state;
  },
};

export const transitions: Transitions<AppState> = {
  startGame,
  endGame,
};
