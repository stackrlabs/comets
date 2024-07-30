import { OBJECT_SCALE } from "./constants";
import { EventSource } from "./events";
import { Screen } from "./screen";
import { random } from "./util";
import { Vector } from "./vector";

const VELOCITY = 300 * OBJECT_SCALE;

// general, garden variety explosion
export class Explosion extends EventSource {
  life: number = 1;
  points: { x: number; y: number; vx: number; vy: number; alpha: number }[] =
    [];

  constructor(
    private x: number,
    private y: number,
    private size: number = 100
  ) {
    super();

    for (let i = 0; i < 15; i++) {
      const v = Vector.fromAngle(random(1, 360), Math.random() * VELOCITY);
      this.points.push({ x: x, y: y, vx: v.x, vy: v.y, alpha: Math.random() });
    }
  }

  update(dt: number) {
    this.points.forEach((point) => {
      point.x += point.vx * dt;
      point.y += point.vy * dt;
      point.alpha -= 0.002;
    });

    this.life -= dt;

    if (this.life <= 0.1) {
      this.trigger("expired");
    }
  }

  render(screen: Screen, dt?: number) {
    this.points.forEach((p) => {
      if (random(1, 10) % 2 === 0) {
        screen.draw.rect(p.x, p.y, 2, 2, `rgba(255,255,255,${p.alpha})`);
      }
    });
  }
}
