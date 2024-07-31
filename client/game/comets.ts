import { IGameState } from "../comets";
import { fetchMruInfo } from "../rpc/api";
import { getWalletClient } from "../rpc/wallet";
import { AttractMode } from "./attractMode";
import { GameMode } from "./gameMode";
import Global from "./global";
import { Highscores } from "./highscores";
import { InitialsMode } from "./initialsMode";
import { Key, Keys } from "./keys";
import { loop } from "./loop";
import { Screen } from "./screen";
import { Sound } from "./sounds";
import { TickRecorder } from "./tickRecorder";
import { World } from "./world";

export class Comets {
  private lastScore = 0;
  private attractMode: AttractMode;
  private gameMode: GameMode;
  private initialsMode: InitialsMode;
  private currentMode: IGameState;
  private tickRecorder: TickRecorder;
  private screen: Screen;

  constructor() {
    this.init();
  }

  init() {
    this.attractMode = new AttractMode(
      new World(Highscores.top.score),
      this.lastScore
    );
    this.screen = new Screen();
    this.currentMode = this.attractMode;
    this.tickRecorder = new TickRecorder();

    const setGameMode = () => {
      this.gameMode = new GameMode(new World(Highscores.top.score));
      this.currentMode = this.gameMode;
      this.tickRecorder.reset();

      this.gameMode.on("done", async (source, world) => {
        // Send ticks in the form of an action to MRU
        // And wait for C1 to confirm score
        this.lastScore = world.score;

        if (Highscores.qualifies(world.score)) {
          this.initialsMode = new InitialsMode(world.score);
          this.currentMode = this.initialsMode;

          this.initialsMode.on("done", () => {
            this.init();
          });
        } else {
          // restart in attract mode
          this.init();
        }
        await this.tickRecorder.sendTicks(this.lastScore);
        console.log("Game over");
      });
    };

    this.attractMode.on("done", () => {
      setGameMode();
    });
  }

  update(dt) {
    if (Key.wasPressed(Keys.GOD)) {
      Global.god = !Global.god;
    }

    if (Key.wasPressed(Keys.DEBUG)) {
      Global.debug = !Global.debug;
    }

    if (Key.wasPressed(Keys.MONITOR_BURN)) {
      Global.burn = !Global.burn;
    }

    if (Key.wasPressed(Keys.PAUSE)) {
      Global.paused = !Global.paused;

      if (Global.paused) {
        Sound.off();
      } else {
        Sound.on();
      }
    }

    if (Global.paused) {
      return;
    }

    const gameInputs = this.tickRecorder.collectInputs();

    // We only record ticks in game mode
    if (this.currentMode === this.gameMode) {
      this.tickRecorder.recordInputs(gameInputs);
    }

    this.currentMode.update(dt, gameInputs);
  }

  render(dt) {
    this.currentMode.render(this.screen, dt);
    Key.update();
  }
}

const game = new Comets();

// setup things
(async () => {
  await fetchMruInfo();
  await getWalletClient();
  setTimeout(() => {
    loop(game);
  }, 1000);
})();
