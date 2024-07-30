import { STF, Transitions } from "@stackr/sdk/machine";
import { WorldState } from "./machine";
import {GameMode} from "../../client/game/gameMode";
import {World} from "../../client/game/world";


export type ValidateGameInput = {
  gameId: number,
  timestamp: number, // nonce
  // Keypresses mapped to action inputs
  inputs: [
    {wasHyperspace: boolean},
    {isRotateLeft: boolean},
    {wasRotateLeft: boolean},
    {isRotateRight: boolean},
    {wasRotateRight: boolean},
    {isThrust: boolean},
    {isFire: boolean},
  ],
};

const validateGame: STF<WorldState, ValidateGameInput> = {
  handler: ({ state, inputs }) => {
    let world = new World(0);
    let gameMode = new GameMode(world);
    for (const input of inputs.inputs) {
      gameMode.update(1/60, input);
    }
    console.log("New score: ", world.score)
    return state;
  },
};

export const transitions: Transitions<WorldState> = {
  validateGame,
};
