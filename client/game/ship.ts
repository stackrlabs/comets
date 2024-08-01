import { Screen } from "./screen";
import { WIDTH, HEIGHT, OBJECT_SCALE } from "./constants";
import { VirtualInput } from "../comets";
import { Object2D } from "./object2d";
import { Vector } from "./vector";
import { Bullet } from "./bullet";
import { fire, thrust } from "./sounds";
import { random } from "./util";

const ACCELERATION: number = 0.1;
const BULLET_SPEED: number = 1000 * OBJECT_SCALE;
const BULLET_TIME: number = 0.1;
const FRICTION: number = 0.005;
const ROTATION: number = 5;
const MAX_ACCELERATION: number = 1100 * OBJECT_SCALE;
const MAX_BULLETS: number = 10;
const VELOCITY = 150 * OBJECT_SCALE;

class Flame extends Object2D {
	constructor(x: number, y: number) {
		super(x, y);

		this.points = [
			{ x: 5, y: 8 },
			{ x: 0, y: 20 },
			{ x: -5, y: 8 },
		];
	}

	update() {}

	render(screen: Screen) {
		this.draw(screen, false);
	}
}

export class Ship extends Object2D {
	private moving: boolean = false;
	private bulletCount: number = 0;
	private bulletTimer: number = 0;
	private flame: Flame;
	public shield: number = 1;
	public trails = [];

	constructor(x: number, y: number) {
		super(x, y);
		this.flame = new Flame(x, y);
		this.points = [
			{ x: 0, y: -15 },
			{ x: 10, y: 10 },
			{ x: 5, y: 5 },
			{ x: -5, y: 5 },
			{ x: -10, y: 10 },
		];

		this.angle = 270;
	}

	render(screen: Screen) {
		this.draw(screen);

		if (this.moving && random(1, 10) % 2 === 0) {
			this.flame.draw(screen, false);
		}

		if (this.trails.length) {
			this.trails.forEach((trail) => {
				if (trail.alpha > 0) {
					screen.draw.shape(
						trail.points,
						trail.x,
						trail.y,
						`rgba(255,0,255,${trail.alpha})`,
						true
					);
					screen.draw.shape(
						trail.points,
						trail.x - 1,
						trail.y - 1,
						`rgba(0,255,255,${trail.alpha})`,
						true
					);
					// Disabling trail update for now
					// trail.alpha -= 0.1;
				}
			});
		}
	}

	update(dt: number, inputs?: VirtualInput) {
		this.move(dt);
		this.flame.move(dt);

		if (inputs.isThrust) {
			this.moving = true;
			this.thrust();
		} else {
			this.moving = false;
		}

		if (inputs.wasRotateLeft) {
			this.rotate(-1);
		}

		if (inputs.isRotateLeft) {
			this.rotate(-ROTATION);
		}

		if (inputs.wasRotateRight) {
			this.rotate(1);
		}

		if (inputs.isRotateRight) {
			this.rotate(ROTATION);
		}

		if (inputs.isFire) {
			this.fire();
		}

		if (inputs.wasHyperspace) {
			this.hyperspace();
		}

		if (this.bulletTimer >= 0) {
			this.bulletTimer -= dt;
		}

		if (
			this.moving &&
			(Math.abs(this.velocity.x) > 200 || Math.abs(this.velocity.y) > 200)
		) {
			this.trails.push({
				points: [...this.points],
				x: this.origin.x,
				y: this.origin.y,
				alpha: 0.5,
			});
		} else {
			this.trails.length = 0;
		}

		// slow down ship over time
		if (!this.moving) {
			this.velocity.friction(FRICTION);
			this.flame.velocity = this.velocity;
		}
	}

	rotate(n: number) {
		super.rotate(n);
		this.flame.rotate(n);
	}

	private thrust() {
		const v = Vector.fromAngle(this.angle, VELOCITY * ACCELERATION);

		if (this.velocity.magnitude < MAX_ACCELERATION) {
			this.velocity.add(v);
			this.flame.velocity = this.velocity;
		}

		// thrust.play();
	}

	private fire() {
		if (this.bulletTimer <= 0 && this.bulletCount < MAX_BULLETS) {
			// fire.play();

			this.bulletTimer = BULLET_TIME;
			this.bulletCount++;

			const velocity = Vector.fromAngle(this.angle);
			const bullet = new Bullet(this.origin, velocity, 1);

			bullet.on("expired", () => {
				this.bulletCount--;
			});

			// move bullet to nose of ship
			const bv = bullet.velocity.copy();
			bv.scale(20, 20);
			bullet.origin.add(bv);

			// adjust for speed of ship if bullets and ship are moving in same general direction
			let speed = 0;
			const dot = this.velocity.dot(bullet.velocity);

			if (dot > 0) {
				speed = this.velocity.magnitude;
			}

			speed = Math.max(BULLET_SPEED, speed + BULLET_SPEED);

			bullet.velocity.scale(speed, speed);

			// kick back
			let kba = (this.angle + 180) % 360;
			let kbv = Vector.fromAngle(kba, 5);

			this.origin.add(kbv);
			this.flame.origin.add(kbv);

			this.trigger("fire", bullet);
		}
	}

	hyperspace() {
		let x = random(40, WIDTH - 40);
		let y = random(40, HEIGHT - 40);

		this.velocity = new Vector(0, 0);
		this.flame.velocity = this.velocity;

		this.x = this.flame.x = x;
		this.y = this.flame.y = y;
	}

	destroy() {
		this.trigger("expired");
	}
}
