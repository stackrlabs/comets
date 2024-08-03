import { IGameState, Rect, VirtualInput } from "../comets";
import { Collisions } from "./collisions";
import { HEIGHT, WIDTH } from "./constants";
import { EventSource } from "./events";
import Global from "./global";
import { Object2D } from "./object2d";
import { Screen } from "./screen";
import { Sound } from "./sounds";
import { Thumper } from "./thump";
import { updateSeed } from "./util";
import { World } from "./world";

export const ACTIONS = [
  "isThrust",
  "wasRotateLeft",
  "isRotateLeft",
  "wasRotateRight",
  "isRotateRight",
  "isFire",
  "wasHyperspace",
];

const WAIT_TIME = 5;
type Options = {
  gameId?: string;
  tickRecorder?: {
    recordInputs: (ticks: VirtualInput) => void;
  };
};
export class GameMode extends EventSource implements IGameState {
  bounds: Object2D[] = [];
  thumper!: Thumper;

  private lastCollisions!: Collisions;
  options: Options;

  constructor(private world: World, options?: Options) {
    super();
    this.options = {
      tickRecorder: {
        recordInputs: () => {},
      },
      gameId: options?.gameId,
    };

    if (options?.tickRecorder) {
      this.options.tickRecorder = options.tickRecorder;
    }
    if (this.options.gameId) {
      updateSeed(this.options.gameId);
    }
  }

  init() {
    Sound.on();
    this.world.addShip(WIDTH / 2, HEIGHT / 2);
    this.world.startLevel();
    this.thumper = new Thumper();
  }

  deserializeAndUpdate(dt: number, input: string) {
    const vi = input.split("").reduce((acc, action, index) => {
      acc[ACTIONS[index]] = action === "1";
      return acc;
    }, {} as VirtualInput);

    this.update(dt, vi);
  }

  update(dt: number, inputs: VirtualInput = {}) {
    this.options.tickRecorder?.recordInputs(inputs);
    this.world.levelTimer += dt;

    if (this.thumper && this.world.ship) {
      this.thumper.update(dt);
    }

    if (this.world.gameOver) {
      this.world.gameOverTimer += dt;

      if (this.world.gameOverTimer >= WAIT_TIME) {
        this.trigger("done", this.world);
      }
    }

    if (!this.world.started) {
      if (this.world.levelTimer >= 2) {
        this.init();
        this.world.started = true;
      }
      return;
    }

    // collisions
    this.lastCollisions = this.checkCollisions(dt) as Collisions;

    // alien?
    this.world.updateAlienTimer(dt);

    if (!this.world.gameOver) {
      // place ship after crash
      if (this.world.shouldTryToPlaceShip()) {
        this.world.tryPlaceShip(dt);
      }

      // check for next level
      if (this.world.shouldCheckForNextLevel()) {
        this.world.startLevel();
        this.thumper.reset();
      }
    }

    // game over
    if (!this.world.lives) {
      this.world.gameOver = true;
    }

    // update all objects
    this.world.update(dt, inputs);
  }

  render(screen: Screen, delta: number) {
    if (Global.paused) {
      return;
    }

    this.renderStatic(screen);

    this.world.render(screen, delta);
  }

  private renderStatic(screen: Screen) {
    screen.draw.background();
    screen.draw.gameTitle();
    screen.draw.stackr();
    screen.draw.scorePlayer1(this.world.score);
    screen.draw.drawExtraLives(this.world.lives);

    // remaining shields
    if (this.world.ship) {
      screen.draw.vectorline(40, 80, 140, 80, `rgba(255,255,255,.4)`);
      screen.draw.vectorline(
        40,
        80,
        40 + this.world.ship.shield * 100,
        80,
        `rgba(255,255,255,.6)`
      );
    }

    // player 1
    if (!this.world.started) {
      screen.draw.readyText();
    }

    if (this.world.gameOver) {
      screen.draw.gameOver();
      screen.draw.signPrompt();
    }

    // debug stuff
    if (Global.debug) {
      this.renderDebug(screen);
    }

    if (Global.god) {
      screen.draw.text2("god", screen.font.small, (width) => {
        return { x: screen.width - width - 10, y: screen.height - 80 };
      });
    }
  }

  private renderDebug(screen: Screen) {
    screen.draw.text2("debug mode", screen.font.small, (width) => {
      return { x: screen.width - width - 10, y: screen.height - 40 };
    });

    if (this.bounds) {
      this.bounds.forEach((r) => {
        screen.draw.bounds(r, "#fc058d");
      });
    }

    if (!this.world.ship && this.world.lives) {
      let rect: Rect = screen.shipRect;
      screen.draw.bounds(rect, "#00ff00");
    }

    if (this.world.ship) {
      screen.draw.text(
        this.world.ship.angle.toString(),
        this.world.ship.origin.x + 20,
        this.world.ship.origin.y + 20,
        10
      );
      screen.draw.text(
        this.world.ship.velocity.x.toString(),
        this.world.ship.origin.x + 20,
        this.world.ship.origin.y + 40,
        10
      );
      screen.draw.text(
        this.world.ship.velocity.y.toString(),
        this.world.ship.origin.x + 20,
        this.world.ship.origin.y + 60,
        10
      );
    }

    const date = new Date();
    date.setSeconds(this.world.levelTimer);

    screen.draw.text2(
      date.toISOString().substr(11, 8),
      screen.font.small,
      (width) => {
        return { x: 10, y: screen.height - 40 };
      }
    );

    if (this.lastCollisions) {
      screen.draw.quadtree(this.lastCollisions.tree);
    }
  }

  private checkCollisions(dt: number) {
    const { ship, rocks, shipBullets, alien, alienBullets, shockwaves } =
      this.world;

    if (!this.world.shouldCheckCollisions()) {
      return;
    }

    this.bounds.length = 0;

    const collisions = new Collisions();

    collisions.bulletCheck(
      shipBullets,
      rocks,
      (bullet, rock) => {
        this.world.shake();
        this.world.addScore(rock, "rock");
        this.world.rockDestroyed(rock);
        bullet.destroy();
      },
      (bullet1, bullet2, rock) => {
        if (Global.debug) {
          this.bounds.push(rock);
        }
      }
    );

    if (alien) {
      collisions.bulletCheck(
        shipBullets,
        [alien],
        (bullet, alien) => {
          this.world.shake();
          this.world.addScore(alien, "alien");
          this.world.alienDestroyed();
          bullet.destroy();
        },
        (bullet1, bullet2, alien) => {
          if (Global.debug) {
            this.bounds.push(alien);
          }
        }
      );
    }

    // shockwaves can break rocks
    let cowboys: any[] = [];
    shockwaves
      .filter((x) => x.rocks.length)
      .forEach((y) => cowboys.push(...y.rocks));

    if (cowboys.length) {
      let indians = this.world.rocks.filter((x) => cowboys.indexOf(x) < 0);
      collisions.check(cowboys, indians, false, (cowboy, indian) => {
        this.world.addScore(cowboy, "cowboy");
        this.world.addScore(indian, "indian");
        this.world.rockDestroyed(cowboy);
        this.world.rockDestroyed(indian);
      });
    }

    if (!Global.god && ship) {
      collisions.check(
        [ship],
        rocks,
        true,
        (ship, rock) => {
          this.world.shake();
          this.world.addScore(rock, "rock in collision");
          this.world.rockDestroyed(rock);

          ship.shield -= 0.25;

          if (ship.shield <= 0) {
            this.world.shipDestroyed();
          }
        },
        (ship, rock) => {
          if (Global.debug) {
            this.bounds.push(rock);
          }
        }
      );

      if (alien) {
        collisions.check(
          [ship],
          [alien],
          true,
          (ship, alien) => {
            this.world.shake();
            this.world.addScore(alien, "alien in collision");
            this.world.alienDestroyed();

            ship.shield -= 0.5;

            if (ship.shield <= 0) {
              this.world.shipDestroyed();
            }
          },
          (ship, alien) => {
            if (Global.debug) {
              this.bounds.push(alien);
            }
          }
        );
      }

      collisions.check(
        alienBullets,
        [ship],
        true,
        (bullet, ship) => {
          this.world.shake();
          ship.shield -= 1;

          if (ship.shield <= 0) {
            this.world.shipDestroyed();
          }

          bullet.destroy();
        },
        (bullet, ship) => {
          if (Global.debug) {
            this.bounds.push(ship);
          }
        }
      );
    }

    if (alien) {
      collisions.check(
        [alien],
        rocks,
        false,
        (alien, rock) => {
          this.world.shake();
          this.world.alienDestroyed();
          this.world.rockDestroyed(rock);
        },
        (alien, rock) => {
          if (Global.debug) {
            this.bounds.push(rock);
          }
        }
      );
    }

    collisions.check(
      alienBullets,
      rocks,
      false,
      (bullet, rock) => {
        this.world.shake();
        this.world.rockDestroyed(rock);
      },
      (bullet, rock) => {
        if (Global.debug) {
          this.bounds.push(rock);
        }
      }
    );

    return collisions;
  }
}