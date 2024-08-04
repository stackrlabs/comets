import { HEIGHT, OBJECT_SCALE, WIDTH } from "./constants";
import { Object2D } from "./object2d";
import { Screen } from "./screen";
import { largeExplosion, mediumExplosion, smallExplosion } from "./sounds";
import { random, randomFloat } from "./util";
import { Vector } from "./vector";

export enum RockSize {
  Small = 5,
  Medium = 10,
  Large = 20,
}

export class Rock extends Object2D {
  rot: number;
  rotTimer: number = 0;
  size: RockSize;
  timeToRot: number;

  private rock1 = [
    [0.5, -2],
    [2, -1],
    [2, -0.7],
    [1.2, 0],
    [2, 1],
    [1, 2],
    [0.5, 1.5],
    [-1, 2],
    [-2, 0.7],
    [-2, -1],
    [-0.5, -1],
    [-1, -2],
  ];

  private rock2 = [
    [0, -1.5],
    [1, -2],
    [2, -1],
    [1, -0.5],
    [2, 0.5],
    [1, 2],
    [-0.5, 1.5],
    [-1, 2],
    [-2, 1],
    [-1.5, 0],
    [-2, -1],
    [-1, -2],
  ];

  private rock3 = [
    [0, -1],
    [1, -2],
    [2, -1],
    [1.5, 0],
    [2, 1],
    [1, 2],
    [-1, 2],
    [-2, 1],
    [-2, -1],
    [-1, -2],
  ];

  private rocks = [this.rock1, this.rock2, this.rock3];

  constructor(
    x: number,
    y: number,
    v: Vector,
    size: RockSize,
    speed: number = 1
  ) {
    super(x, y);

    const velocity = speed * OBJECT_SCALE;

    this.velocity.x = v.x * velocity;
    this.velocity.y = v.y * velocity;

    const type = random(0, 2);
    const def = this.rocks[type];

    this.points = def.map((p) => {
      return {
        x: p[0] * size,
        y: p[1] * size,
      };
    });

    this.size = size;
    this.rotate(random(1, 90));
    this.rot = random(0.01, 1) % 2 === 0 ? 1 : -1;
    this.timeToRot = random(1, 5);
  }

  update(dt: number) {
    this.rotTimer += 1;
    this.move(dt);

    if (this.rotTimer === this.timeToRot) {
      this.rotate(this.rot);
      this.rotTimer = 0;
    }
  }

  render(screen: Screen) {
    this.draw(screen);
  }

  get direction() {
    const radians = Math.atan2(this.velocity.y, this.velocity.x);
    let degrees = radians * (180 / Math.PI);
    degrees = degrees > 0.0 ? degrees : 360 + degrees;
    return Math.floor(degrees);
  }

  split(): Rock[] {
    let sound;

    switch (this.size) {
      case RockSize.Large:
        sound = largeExplosion;
        break;

      case RockSize.Medium:
        sound = mediumExplosion;
        break;

      case RockSize.Small:
        sound = smallExplosion;
        break;
    }

    const rate = randomFloat(0.7, 1);
    // sound.rate(rate);
    sound.play();

    if (this.size > RockSize.Small) {
      let angle1 = random(this.direction, this.direction + 80);
      let angle2 = random(this.direction - 80, this.direction);

      if (angle1 < 0) {
        angle1 += 360;
      }

      if (angle1 > 360) {
        angle1 -= 360;
      }

      if (angle2 < 0) {
        angle2 += 360;
      }

      if (angle2 > 360) {
        angle2 -= 360;
      }

      const size =
        this.size === RockSize.Large ? RockSize.Medium : RockSize.Small;
      const v1 = Vector.fromAngle(angle1);
      const v2 = Vector.fromAngle(angle2);
      const speed1 =
        size === RockSize.Medium ? random(150, 250) : random(250, 350);
      const speed2 =
        size === RockSize.Medium ? random(150, 250) : random(250, 350);
      const rock1 = new Rock(this.origin.x, this.origin.y, v1, size, speed1);
      const rock2 = new Rock(this.origin.x, this.origin.y, v2, size, speed2);

      return [rock1, rock2];
    }

    return [];
  }

  get score(): number {
    if (this.size === RockSize.Large) {
      return 20;
    }

    if (this.size === RockSize.Medium) {
      return 50;
    }

    return 100;
  }
}

export function createRocks(level: number): Rock[] {
  const rocks = [];
  const count = 1;
  const speed = 150;
  const offset = 20;

  for (let i = 0; i < count; i++) {
    const zone = random(1, 4);
    const v = Vector.fromAngle(random(1, 360));
    let x: number;
    let y: number;

    switch (zone) {
      case 1:
        x = random(offset, WIDTH - offset);
        y = random(offset, offset * 2);
        break;
      case 2:
        x = random(WIDTH - offset * 2, WIDTH - offset);
        y = random(HEIGHT - offset, HEIGHT - offset);
        break;
      case 3:
        x = random(offset, WIDTH - offset);
        y = random(HEIGHT - offset, HEIGHT - offset);
        break;
      default:
        x = random(offset, offset * 2);
        y = random(HEIGHT - offset, HEIGHT - offset);
        break;
    }

    const rock = new Rock(x, y, v, RockSize.Large, speed);
    rocks.push(rock);
  }

  return rocks;
}
