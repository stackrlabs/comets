import { State, StateMachine } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";

import { transitions } from "./transitions";
import genesisState from "../genesis-state.json";

interface World {
  time: number;
  x: number;
  y: number;
}

export class WorldState extends State<World> {
  constructor(state: World) {
    super(state);
  }

  getRootHash() {
    return solidityPackedKeccak256(
      ["uint", "uint", "uint"],
      [this.state.time, this.state.x, this.state.y]
    );
  }
}

const machine = new StateMachine({
  id: "worldEngine",
  stateClass: WorldState,
  initialState: genesisState.state,
  on: transitions,
});

export { machine };
