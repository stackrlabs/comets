import { IGameState } from "../comets";
import { fetchMruInfo, startGame } from "../rpc/api";
import { addToStore, getFromStore, StorageKey } from "../rpc/storage";
import { DemoMode } from "./demoMode";
import { EventSource } from "./events";
import { HighScoreMode } from "./highScoreMode";
import { Key } from "./keys";
import { Screen } from "./screen";
import { Sound } from "./sounds";
import { World } from "./world";

const ATTRACT_TIME = 15;

// combines DemoMode and HighscoreMode to attract people to part with their quarters
export class AttractMode extends EventSource implements IGameState {
  private currentMode: IGameState;
  private modes: IGameState[];
  private isStarting = false;

  constructor(world: World, lastScore: number) {
    super();

    this.modes = [
      new HighScoreMode(lastScore),
      new DemoMode(world || new World()),
    ];

    this.currentMode = this.modes[0];

    Sound.stop();
    Sound.off();
  }

  update(step: number) {
    this.currentMode.update(step);

    // TODO: GET rid of this once reload is fixed
    if (getFromStore(StorageKey.GAME_ID)) {
      this.trigger("done");
    }

    if (Key.isAnyPressed()) {
      if (!this.isStarting) {
        this.isStarting = true;
        startGame()
          .then((res) => {
            console.log("Game started", res.logs[0].value);
            addToStore(StorageKey.GAME_ID, res.logs[0].value);
            this.isStarting = false;
            this.trigger("done");
          })
          .catch((e) => {
            console.error("Error starting game", e.message);
          })
          .finally(() => {
            this.isStarting = false;
          });
      }
    }
  }

  render(screen: Screen, dt?: number) {
    this.currentMode.render(screen, dt);
  }
}
