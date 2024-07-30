import { loop } from "./loop";
import { Key, Keys } from "./keys";
import { World } from "./world";
import { Sound } from "./sounds";
import { Highscores } from "./highscores";
import { AttractMode } from "./attractMode";
import { InitialsMode } from "./initialsMode";
import { GameMode } from "./gameMode";
import Global from "./global";
import { TickRecorder } from "./tickRecorder";

export class Asteroids {
  private lastScore = 0;
  private attractMode: AttractMode;
  private gameMode: GameMode;
  private initialsMode: InitialsMode;
  private currentMode: IGameState;
  private tickRecorder: TickRecorder;

  constructor() {
    this.init();
  }

  init() {
    this.attractMode = new AttractMode(
      new World(Highscores.top.score),
      this.lastScore
    );
    this.currentMode = this.attractMode;

    const setGameMode = () => {
      this.gameMode = new GameMode(new World(Highscores.top.score));
      this.currentMode = this.gameMode;
      this.tickRecorder = new TickRecorder();

      this.gameMode.on("done", (source, world) => {
        // Send ticks in the form of an action to MRU
        // And wait for C1 to confirm score
        this.tickRecorder.sendTicks();
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

    // We only record ticks in game mode
    if (this.currentMode === this.gameMode) {
      this.tickRecorder.collectInputs();
    }

    this.currentMode.update(dt);
  }

  render(dt) {
    this.currentMode.render(dt);
    Key.update();
  }
}

const game = new Asteroids();

setTimeout(() => {
  loop(game);
}, 1000);
