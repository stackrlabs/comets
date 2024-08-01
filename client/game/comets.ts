import { IGameState } from "../comets";
import { fetchLeaderboard, fetchMruInfo } from "../rpc/api";
import { removeFromStore, StorageKey } from "../rpc/storage";
import { getWalletClient } from "../rpc/wallet";
import { AttractMode } from "./attractMode";
import { GameMode } from "./gameMode";
import { Key } from "./keys";
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
      this.tickRecorder.reset();
      this.gameMode = new GameMode(new World(), this.tickRecorder);
      this.currentMode = this.gameMode;

      this.gameMode.on("done", (source, world) => {
        Sound.off();
        // Send ticks in the form of an action to MRU
        // And wait for C1 to confirm score
        this.lastScore = world.score;
        if (!this.isSendingTicks) {
          this.isSendingTicks = true;
          this.tickRecorder
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
              console.log("Game over");
              this.init();
              // Reload page
              window.location.reload();
            });
        }
        // restart in attract mode
      });
    };

    this.attractMode.on("done", () => {
      console.log("Start Game");
      setGameMode();
    });
  }

  update(dt) {
    const gameInputs = this.tickRecorder.collectInputs();
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
