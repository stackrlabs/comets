import { IGameState } from "../comets";
import { EventSource } from "./events";
import { HighScoreMode } from "./highScoreMode";
import { KeyManager } from "./keys";
import { leaderboard } from "./leaderboard";
import { Screen } from "./screen";
import { Sound } from "./sounds";

export class MainPage extends EventSource implements IGameState {
  private currentMode: IGameState;
  private modes: IGameState[];
  private keyManager: KeyManager;
  private handleEnterPressed: () => Promise<number | undefined>;

  constructor(
    keyManager: KeyManager,
    lastScore: number,
    handleEnterPressed: () => Promise<number | undefined>
  ) {
    super();
    this.keyManager = keyManager;
    this.handleEnterPressed = handleEnterPressed;
    this.modes = [new HighScoreMode(lastScore)];

    this.currentMode = this.modes[0];
    leaderboard.refresh();
    Sound.stop();
    Sound.off();
  }

  async update(step: number) {
    this.currentMode.update(step, {});
    if (this.keyManager.isEnterPressed()) {
      const gameId = await this.handleEnterPressed();
      if (gameId) {
        this.trigger("done");
      }
      this.keyManager.clear();
    }
  }

  render(screen: Screen, dt: number) {
    this.currentMode.render(screen, dt);
  }
}
