import { State, StateMachine } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";
import { World } from "../../game/world";

import { transitions } from "./transitions";

export class WorldState extends State<World> {
  constructor(state: World) {
    super(state);
  }

  getRootHash() {
    return solidityPackedKeccak256(["uint256"], [this.state]);
  }
}

const machine = new StateMachine({
  id: "worldEngine",
  stateClass: WorldState,
  initialState: new World(0),
  on: transitions,
});

export { machine };
