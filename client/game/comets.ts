import { IGameState } from "../comets";
import { fetchLeaderboard, fetchMruInfo } from "../rpc/api";
import { removeFromStore, StorageKey } from "../rpc/storage";
import { getWalletClient } from "../rpc/wallet";
import { AttractMode } from "./attractMode";
import { GameMode } from "./gameMode";
import Global from "./global";
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
  private currentMode: IGameState;
  private tickRecorder: TickRecorder;
  private screen: Screen;
  private isSendingTicks = false;

  constructor() {
    this.init();
  }

  init() {
    this.attractMode = new AttractMode(new World(), this.lastScore);
    this.screen = new Screen();
    this.currentMode = this.attractMode;
    this.tickRecorder = new TickRecorder();

    const setGameMode = () => {
      this.gameMode = new GameMode(new World());
      this.currentMode = this.gameMode;
      this.tickRecorder.reset();

      this.gameMode.on("done", async (source, world) => {
        // Send ticks in the form of an action to MRU
        // And wait for C1 to confirm score
        this.lastScore = world.score;
        if (!this.isSendingTicks) {
          this.isSendingTicks = true;
          await this.tickRecorder
            .sendTicks(this.lastScore)
            .then(() => {
              console.log("Sent ticks");
            })
            .catch((e) => {
              console.error("Error sending ticks", e.message);
            })
            .finally(() => {
              removeFromStore(StorageKey.GAME_ID);
              this.isSendingTicks = false;
              this.init();
              // Reload page
              window.location.reload();
            });
        }
        // restart in attract mode
        console.log("Game over");
      });
    };

    this.attractMode.on("done", () => {
      console.log("Done with Attract Mode");
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
  await Promise.all([fetchMruInfo(), fetchLeaderboard()]);
  await getWalletClient();
  setTimeout(() => {
    loop(game);
  }, 1000);
})();
