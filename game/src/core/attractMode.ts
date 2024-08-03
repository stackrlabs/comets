import { IGameState } from "../comets";
import { startGame } from "../rpc/api";
import { addToStore, StorageKey } from "../rpc/storage";
import { EventSource } from "./events";
import { HighScoreMode } from "./highScoreMode";
import { KeyManager } from "./keys";
import { leaderboard } from "./leaderboard";
import { Screen } from "./screen";
import { Sound } from "./sounds";

export class MainPage extends EventSource implements IGameState {
  private currentMode: IGameState;
  private modes: IGameState[];
  private isStarting = false;
  private keyManager: KeyManager;

  constructor(keyManager: KeyManager, lastScore: number) {
    super();
    this.keyManager = keyManager;
    this.modes = [new HighScoreMode(lastScore)];

    this.currentMode = this.modes[0];
    leaderboard.refresh();
    Sound.stop();
    Sound.off();
  }

  update(step: number) {
    this.currentMode.update(step, {});

    if (this.keyManager.isEnterPressed()) {
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
            // clears the keys to prevent the game from starting again
            this.keyManager.clear();
          });
      }
    }
  }

  render(screen: Screen, dt: number) {
    this.currentMode.render(screen, dt);
  }
}
