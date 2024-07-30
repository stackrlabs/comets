import { STF, Transitions } from "@stackr/sdk/machine";
import { WorldState } from "./machine";

const tick: STF<WorldState> = {
  handler: ({ state, inputs }) => {
    state.time = inputs.timestamp;
    state.x = inputs.x;
    state.y = inputs.y;
    return state;
  },
};

export const transitions: Transitions<WorldState> = {
  tick,
};
