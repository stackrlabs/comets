import { IGameState, Rect, VirtualInput } from "../comets";
import { Alien, BigAlien, SmallAlien } from "./alien";
import { Bullet } from "./bullet";
import { HEIGHT, SHIP_RECT, WIDTH } from "./constants";
import { Explosion } from "./explosion";
import { Flash } from "./flash";
import { Object2D } from "./object2d";
import { Rock, createRocks } from "./rocks";
import { ScoreMarker } from "./scoreMarker";
import { Screen } from "./screen";
import { Ship } from "./ship";
import { Shockwave } from "./shockwave";
import { SlowMoTimer } from "./slowMoTimer";
import {
  alienFire,
  extraLife,
  getPowerup,
  largeAlien,
  largeExplosion,
  smallAlien,
} from "./sounds";
import { random } from "./util";

const EXTRA_LIFE = 100_000;
const SHAKE_TIME = 0.5;

let explosionCount = 0;
let maxExplosionCount = 0;
let maxExplosionThreshold = 10;
let explosionScores: number[] = [];

const NUM_OF_LIVES = 1;
export class World {
  level = 1;
  extraLifeScore = 0;
  score = 0;
  lives = NUM_OF_LIVES;

  ship: Ship;
  shipBullets: Bullet[] = [];
  alien: Alien;
  alienBullets: Bullet[] = [];
  shockwaves: Shockwave[] = [];
  rocks: Rock[] = [];

  // things with no collision detection - markers, explosions, flash, etc.
  scenery: IGameState[] = [];

  shipTimer: number = 0;
  alienTimer: number = 0;
  levelTimer: number = 0;
  gameOverTimer: number = 0;
  shakeTimer: number = 0;
  powerupTimer: number = 0;
  dramaticPauseTimer: number = 0;
  slowMoTimer: SlowMoTimer = null;

  gameOver: boolean = false;
  started: boolean = false;

  constructor() {}

  get objects(): any {
    return [
      this.ship,
      this.alien,
      ...this.shipBullets,
      ...this.alienBullets,
      ...this.rocks,
      ...this.shockwaves,
      ...this.scenery,
    ];
  }

  update(dt: number, inputs: VirtualInput) {
    if (this.slowMoTimer) {
      dt = this.slowMoTimer.adjust(dt);
    }

    if (this.dramaticPauseTimer > 0) {
      this.dramaticPauseTimer--;
      return;
    }

    // shaky cam
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }

    this.objects.forEach((obj) => {
      if (obj) {
        obj.update(dt, inputs);
      }
    });
  }

  render(screen: Screen, dt?: number) {
    if (this.slowMoTimer) {
      dt = this.slowMoTimer.adjust(dt);
    }

    if (this.shakeTimer > 0) {
      screen.preShake();
    }

    this.objects.forEach((obj) => {
      if (obj) {
        obj.render(screen, dt);
      }
    });

    if (this.shakeTimer > 0) {
      screen.postShake();
    }
  }

  startLevel() {
    this.level++;
    this.levelTimer = 0;
    this.powerupTimer = 0;

    if (!this.alienTimer) {
      this.alienTimer = random(10, 15);
    }

    this.scenery.length = 0;
    this.shipBullets.forEach((bullet) => bullet.destroy());

    this.addRocks();
  }

  private addRocks() {
    this.rocks = createRocks(this.level);
  }

  addShip(x: number, y: number) {
    this.ship = new Ship(x, y);

    this.ship.on("fire", (ship, bullet) => {
      bullet.on("expired", () => {
        this.shipBullets = this.shipBullets.filter((x) => x !== bullet);
      });

      this.shipBullets.push(bullet);
    });

    this.ship.on("expired", () => {
      this.lives--;
      this.ship = null;
      this.shipBullets.length = 0;
    });
  }

  createExplosion(
    obj: Object2D,
    size: number = 100,
    multiplier: number = 1
  ): { explosion: Explosion; shockwave: Shockwave } {
    if (!obj) {
      return;
    }

    const explosion = new Explosion(obj.origin.x, obj.origin.y, size);
    explosionCount++;

    explosionScores.push(obj.score);

    if (explosionScores.length > maxExplosionThreshold) {
      explosionScores.pop();
    }

    if (explosionCount > maxExplosionCount) {
      maxExplosionCount = explosionCount;

      // TODO: this was exploding the game
      // if (maxExplosionCount > maxExplosionThreshold) {
      //   explosionCount = 0;
      //   console.log("MAX DAMAGE ACHEIVEMENT");

      //   this.setSlowMo(0.25, 4);

      //   let bonus = 0;
      //   explosionScores.forEach((v) => (bonus += v));
      //   bonus *= 5;

      //   const achievement = new Achievement(`MASSIVE DAMAGE`, bonus);
      //   this.addScenery(achievement);
      //   this.addScore(achievement, "achievement");

      //   //const marker = new ScoreMarker(obj, `+${bonus}`);
      //   //this.addScenery(marker);

      //   // Track score of each explosion and display total points with achievement

      //   maxExplosionThreshold += 10;
      // }
    }

    explosion.on("expired", () => {
      explosionCount--;
    });

    this.addScenery(explosion);

    const shockwave = new Shockwave(
      obj.origin.x,
      obj.origin.y,
      obj.velocity,
      size,
      multiplier
    );

    shockwave.on("expired", () => {
      this.shockwaves = this.shockwaves.filter((x) => x !== shockwave);
    });

    this.shockwaves.push(shockwave);

    return {
      explosion,
      shockwave,
    };
  }

  setSlowMo(time: number, factor: number) {
    if (!this.slowMoTimer) {
      this.slowMoTimer = new SlowMoTimer(time, factor);
      this.slowMoTimer.on("expired", () => (this.slowMoTimer = null));
    }
  }

  shipDestroyed() {
    if (this.ship) {
      largeExplosion.play();
      this.createExplosion(this.ship);
      this.addFlash(5);
      this.ship.destroy();
      this.setSlowMo(0.25, 8);
    }
  }

  alienDestroyed() {
    if (this.alien) {
      this.addFlash(5);
      this.createExplosion(this.alien);
      this.alien.destroy();
    }
  }

  addFlash(frames: number) {
    const flash = new Flash(frames);
    this.addScenery(flash);
  }

  addScenery(obj: any) {
    obj.on("expired", () => {
      this.scenery = this.scenery.filter((x) => x !== obj);
    });

    this.scenery.push(obj);
  }

  rockDestroyed(rock: Rock, multiplier: number = 1) {
    let boom = this.createExplosion(rock, rock.size * 5, multiplier);
    let debris = rock.split();

    this.rocks = this.rocks.filter((x) => x !== rock);
    this.rocks.push(...debris);

    this.shockwaves.forEach((shockwave) => {
      shockwave.rocks = shockwave.rocks.filter((x) => x !== rock);
    });

    boom.shockwave.rocks = debris;

    rock = null;
  }

  addAlien() {
    const lvl = Math.min(this.level, 14);
    let little = false;
    let alienSound = largeAlien;

    if (this.score >= 40000) {
      little = true;
    } else {
      switch (lvl) {
        case 7:
          little = this.levelTimer > 60 && random(1, 3) === 2;
          break;
        case 8:
          little = this.levelTimer > 30 && random(1, 10) % 2 === 0;
          break;
        default:
          little = random(1, 10) <= lvl + 2;
          break;
      }
    }

    if (little) {
      alienSound = smallAlien;
      this.alien = new SmallAlien(this.ship);
    } else {
      this.alien = new BigAlien();
    }

    alienSound.play();

    this.alien.on("expired", () => {
      alienFire.stop();
      alienSound.stop();
      largeExplosion.play();
      this.alien = null;
      this.alienBullets.forEach((b) => b.destroy());
      this.alienBullets.length = 0;
    });

    this.alien.on("fire", (alien, bullet: Bullet) => {
      alienFire.play();

      bullet.on("expired", () => {
        this.alienBullets = this.alienBullets.filter((x) => x !== bullet);
      });

      this.alienBullets.push(bullet);
    });
  }

  // TODO: remove second argument
  addScore(obj: Object2D, name: string) {
    console.log(obj.score, name);
    this.score += obj.score;
    this.extraLifeScore += obj.score;

    if (this.extraLifeScore >= EXTRA_LIFE) {
      this.lives++;
      this.extraLifeScore -= EXTRA_LIFE;
      extraLife.play();
    }

    this.addScenery(new ScoreMarker(obj, `${obj.score}`));
  }

  addPowerup() {
    getPowerup.play();
  }

  shake() {
    if (this.shakeTimer <= 0.0) {
      this.shakeTimer = SHAKE_TIME;
    }
  }

  tryPlaceShip(dt) {
    this.shipTimer += dt;

    if (this.shipTimer <= 2) {
      return;
    }

    let rect: Rect = SHIP_RECT;

    let collided = false;

    this.rocks.forEach((rock) => {
      collided = collided || rock.collided(rect);
    });

    if (this.alien) {
      collided = collided || this.alien.collided(rect);
    }

    if (!collided) {
      this.shipTimer = 0;
      this.addShip(WIDTH / 2, HEIGHT / 2);
    }
  }

  updateAlienTimer(dt: number) {
    if (!this.alien) {
      this.alienTimer -= dt;

      if (this.alienTimer <= 0) {
        this.addAlien();
        this.alienTimer = random(10, 15);
      }
    }
  }

  shouldTryToPlaceShip(): boolean {
    return !!this.shipTimer || (!this.ship && !!this.lives);
  }

  shouldCheckForNextLevel(): boolean {
    return !this.rocks.length && !!this.lives;
  }

  shouldCheckCollisions(): boolean {
    return !!this.ship || !!this.shipBullets.length;
  }
}
