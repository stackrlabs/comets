import { STF, Transitions } from "@stackr/sdk/machine";
import { WorldState } from "./machine";

const tick: STF<WorldState> = {
  handler: ({ state }) => {
    state.update(1 / 60);
    return state;
  },
};

export const transitions: Transitions<WorldState> = {
  tick,
};
