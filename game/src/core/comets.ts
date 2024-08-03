import { IGameState } from "../comets";
import { getFromStore, removeFromStore, StorageKey } from "../rpc/storage";
import { MainPage } from "./attractMode";
import { GameMode } from "./gameMode";
import { KeyManager } from "./keys";
import { Screen } from "./screen";
import { Sound } from "./sounds";
import { TickRecorder } from "./tickRecorder";
import { World } from "./world";

export class Comets {
  private lastScore = 0;
  private attractMode!: MainPage;
  private gameMode!: GameMode;
  private currentMode!: IGameState;
  private tickRecorder!: TickRecorder;
  private screen!: Screen;
  private isSendingTicks = false;
  private keyManager!: KeyManager;

  constructor() {
    this.init();
  }

  init() {
    this.keyManager = new KeyManager();
    this.attractMode = new MainPage(this.keyManager, this.lastScore);
    this.screen = new Screen();
    this.currentMode = this.attractMode;
    this.tickRecorder = new TickRecorder(this.keyManager);

    const setGameMode = (gameId: string) => {
      this.tickRecorder.reset();
      this.gameMode = new GameMode(new World(), {
        tickRecorder: this.tickRecorder,
        gameId,
      });

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
            });
        }
      });
    };

    this.attractMode.on("done", () => {
      console.log("Start Game");
      setGameMode(getFromStore(StorageKey.GAME_ID));
    });
  }

  update(dt: number) {
    const gameInputs = this.tickRecorder.collectInputs();
    this.currentMode.update(dt, gameInputs);
  }

  render(dt: number) {
    this.currentMode.render(this.screen, dt);
    this.keyManager.update();
  }
}
