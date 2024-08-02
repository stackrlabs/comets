import { State, StateMachine } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";
import genesisState from "../genesis-state.json";
import { transitions } from "./transitions";

interface GameState {
  score: number;
  player: string;
}

interface RawState {
  games: Array<GameState & { id: string }>;
}

interface WrappedState {
  games: Record<string, GameState>;
}

export class AppState extends State<RawState, WrappedState> {
  constructor(state: RawState) {
    super(state);
  }

  transformer() {
    return {
      wrap: () => {
        const games = this.state.games.reduce((acc, game) => {
          const { id, ...rest } = game;
          acc[id] = { ...rest };
          return acc;
        }, {});
        return { games };
      },

      unwrap: (wrappedState: WrappedState) => {
        const games = Object.keys(wrappedState.games).map((id) => ({
          id,
          score: wrappedState.games[id].score,
          player: wrappedState.games[id].player,
        }));
        return { games };
      },
    };
  }

  // TODO: change this to MerkleTree
  getRootHash() {
    return solidityPackedKeccak256(
      ["string"],
      [JSON.stringify(this.state.games)]
    );
  }
}

const MACHINE_ID = "worldEngine";
const machine = new StateMachine({
  id: MACHINE_ID,
  stateClass: AppState,
  initialState: genesisState.state,
  on: transitions,
});

export { machine, MACHINE_ID };
