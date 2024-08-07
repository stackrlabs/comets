import { Bullet } from "./bullet";
import { HEIGHT, OBJECT_SCALE, WIDTH } from "./constants";
import { Object2D } from "./object2d";
import { Screen } from "./screen";
import { Ship } from "./ship";
import { random } from "./util";
import { Vector } from "./vector";

const BIG_ALIEN_BULLET_SPEED: number = 600 * OBJECT_SCALE;
const SMALL_ALIEN_BULLET_SPEED: number = 800 * OBJECT_SCALE;
const BIG_ALIEN_SPEED: number = 225 * OBJECT_SCALE;
const SMALL_ALIEN_SPEED: number = 250 * OBJECT_SCALE;

export abstract class Alien extends Object2D {
  moveTimer: number = 0;
  moveTime: number = 1;
  bulletTimer: number = 0;
  bulletTime: number = 0.7;

  abstract fire(): void;
  abstract destroy(): void;

  constructor(speed: number) {
    super(0, 0);

    this.velocity.y = 0;

    this.origin.y = random(100, HEIGHT - 100);

    if (this.origin.y % 2 === 0) {
      this.origin.x = 40;
      this.velocity.x = speed;
    } else {
      this.origin.x = WIDTH - 40;
      this.velocity.x = -speed;
    }

    this.points = [
      { x: 0.5, y: -2 },
      { x: 1, y: -1 },
      { x: 2.5, y: 0 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -2.5, y: 0 },
      { x: -1, y: -1 },
      { x: -0.5, y: -2 },
    ];
  }

  update(dt: number) {
    this.move(dt);

    if (this.origin.x >= WIDTH - 5 || this.origin.x <= 5) {
      this.trigger("expired");
      return;
    }

    // direction changes
    this.moveTimer += dt;

    if (this.moveTimer >= 1 && this.velocity.y !== 0) {
      this.velocity.y = 0;
      this.moveTimer = 0;
    }

    if (this.moveTimer >= this.moveTime) {
      let move = random(1, 20) % 2 === 0;

      if (move) {
        this.velocity.y =
          this.origin.x % 2 === 0 ? this.velocity.x : -this.velocity.x;
      }

      this.moveTimer = 0;
    }

    // firing
    this.bulletTimer += dt;

    if (this.bulletTimer >= this.bulletTime) {
      this.fire();
      this.bulletTimer = 0;
    }
  }

  render(screen: Screen) {
    this.draw(screen);
  }

  draw(screen: Screen) {
    super.draw(screen);
    screen.draw.vectorShape(
      [this.points[1], this.points[6]],
      this.origin.x,
      this.origin.y
    );
    screen.draw.vectorShape(
      [this.points[2], this.points[5]],
      this.origin.x,
      this.origin.y
    );
  }
}

// Mr. Bill
export class BigAlien extends Alien {
  constructor() {
    super(BIG_ALIEN_SPEED);
    this.score = 200;
    this.scale(7);
  }

  fire() {
    const v = Vector.fromAngle(random(1, 360), BIG_ALIEN_BULLET_SPEED);
    const bullet = new Bullet(this.origin, v);
    this.trigger("fire", bullet);
  }

  destroy() {
    this.trigger("expired");
  }
}

export class SmallAlien extends Alien {
  bulletTime: number = 1;

  constructor(private ship: Ship | null) {
    super(SMALL_ALIEN_SPEED);
    this.score = 1000;
    this.scale(4);
  }

  fire() {
    let bullet;

    if (this.ship) {
      // target ship
      const v = Vector.fromXY(
        this.ship.origin,
        this.origin,
        SMALL_ALIEN_BULLET_SPEED
      );
      bullet = new Bullet(this.origin, v, 2);
    } else {
      // random fire
      const v = Vector.fromAngle(random(1, 360), SMALL_ALIEN_BULLET_SPEED);
      bullet = new Bullet(this.origin, v, 2);
    }

    this.trigger("fire", bullet);
  }

  destroy() {
    this.ship = null;
    this.trigger("expired");
  }
}
