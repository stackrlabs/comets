import { Key } from './keys';
import screen from './screen';
import { Object2D } from './object2d';
import { Bullet } from './bullet';
import { VECTOR } from './lut';

const ACCELERATION: number = 0.2;
const FRICTION: number = 0.007;
const ROTATION: number = 5;
const MAX_ACCELERATION: number = 1100;
const MAX_BULLETS: number = 4;
const VELOCITY = 100;

class Flame extends Object2D {

    constructor(x: number, y: number) {
        super(x, y);

        this.points = [
            {x: 5, y: 8},
            {x: 0, y: 20},
            {x: -5, y: 8},
        ];
    }

    update() {

    }

    render() {
        this.draw();    
    }
}

export class Ship extends Object2D {

    private moving: boolean = false;
    private bulletCount: number = 0;
    private flame: Flame;

    constructor(x: number, y: number) {
        super(x, y);
        this.flame = new Flame(x, y);
        this.points = [
            {x: 0, y: -15},
            {x: 10, y: 10},
            {x: 5, y: 5},
            {x: -5, y: 5},
            {x: -10, y: 10},
            {x: 0, y: -15}
        ];

        this.angle = 270;
    }

    render() {
        screen.draw.shape(this.points, this.origin.x, this.origin.y, this.color);
        if (this.moving && (Math.floor(Math.random() * 10) + 1) % 2 === 0) {
            this.flame.draw();
        }
    }

    update(step: number) {
        this.move(step);
        this.flame.move(step);

        if (Key.isDown(Key.UP)) {
            this.moving = true;
            this.thrust();
        } else {
            this.moving = false;
        }

        if (Key.isDown(Key.LEFT)) {
            this.rotate(-ROTATION);
        }

        if (Key.isDown(Key.RIGHT)) {
            this.rotate(ROTATION);
        }

        if (Key.isPressed(Key.CTRL)) {
            this.fire();
        }

        // slow down ship over time
        if (!this.moving) {
            this.vx -= this.vx * FRICTION;
            this.vy -= this.vy * FRICTION;
            this.flame.vx = this.vx;
            this.flame.vy = this.vy;
        }
    }

    rotate(n: number) {
        super.rotate(n);
        this.flame.rotate(n);
    }

    private thrust() {
        let v = VECTOR[this.angle];
        let tx = v.x * VELOCITY * ACCELERATION;
        let ty = v.y * VELOCITY * ACCELERATION;

        this.vx += tx;
        this.flame.vx = this.vx;
        
        this.vy += ty;
        this.flame.vy = this.vy;

        let velocity = this.magnitude;

        if (velocity > MAX_ACCELERATION) {
            this.vx = this.vx / velocity;
            this.vy = this.vy / velocity;
            this.vx *= MAX_ACCELERATION;
            this.vy *= MAX_ACCELERATION;
            this.flame.vx = this.vx;
            this.flame.vy = this.vy;
        }
    }

    private fire() {
        if (this.bulletCount < MAX_BULLETS) {
            
            this.bulletCount++;

            let bullet = new Bullet(this.origin.x, this.origin.y, this.angle);

            bullet.on('expired', () => {
                this.bulletCount--;
            });

            // move bullet to nose of ship
            bullet.origin.x += bullet.vx * 20;
            bullet.origin.y += bullet.vy * 20;
            
            // adjust for speed of ship if bullets and ship are moving in same general direction
            let speed = 0; 
            let dot = (this.vx * bullet.vx) + (this.vy * bullet.vy);
            
            console.log(this.magnitude);

            if (dot > 0) {
                speed = this.magnitude;
            }

            bullet.vx *= Math.max(1000, speed + 1000);
            bullet.vy *= Math.max(1000, speed + 1000);


            this.trigger('fire', bullet);
        }
    }
}