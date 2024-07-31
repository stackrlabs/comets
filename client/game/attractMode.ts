import { IGameState } from "../comets";
import { startGame } from "../rpc/api";
import { addToStore, getFromStore, StorageKey } from "../rpc/storage";
import { DemoMode } from "./demoMode";
import { EventSource } from "./events";
import { HighScoreMode } from "./highScoreMode";
import { Highscores } from "./highscores";
import { Key } from "./keys";
import { Screen } from "./screen";
import { Sound } from "./sounds";
import { World } from "./world";

const ATTRACT_TIME = 15;

// combines DemoMode and HighscoreMode to attract people to part with their quarters
export class AttractMode extends EventSource implements IGameState {
  private demoTimer = 0;
  private currentMode: IGameState;
  private modes: IGameState[];
  private index: number = 0;
  private isStarting = false;

  constructor(world: World, lastScore: number) {
    super();

    this.modes = [
      new HighScoreMode(lastScore),
      new DemoMode(world || new World(Highscores.top.score)),
    ];

    this.currentMode = this.modes[0];

    Sound.stop();
    Sound.off();
  }

  update(step: number) {
    this.currentMode.update(step);
    // since page is reloaded on update for now, we need to check if game is already started
    if (getFromStore(StorageKey.GAME_ID)) {
      this.trigger("done");
    }

    if (Key.isAnyPressed()) {
      if (getFromStore(StorageKey.GAME_ID)) {
        this.trigger("done");
      } else if (!this.isStarting) {
        this.isStarting = true;
        startGame().then((res) => {
          if (res?.error || !res.isOk) {
            console.error(res.error);
            return;
          }
          console.log("Game started", res.logs[0].value);
          addToStore(StorageKey.GAME_ID, res.logs[0].value);
          this.isStarting = false;
        });
      }
    } else {
      this.updateAttractTimer(step);
    }
  }

  render(screen: Screen, dt?: number) {
    this.currentMode.render(screen, dt);
  }

  updateAttractTimer(step: number) {
    this.demoTimer += step;

    if (this.demoTimer >= ATTRACT_TIME) {
      this.demoTimer = 0;
      this.index = 1 - this.index;
      this.currentMode = this.modes[this.index];
    }
  }
}
