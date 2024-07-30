import { Screen, OBJECT_SCALE } from './screen';
import { Vector } from './vector';
import { Object2D } from './object2d';
import { Point } from '../comets';

export class Bullet extends Object2D { 

    frame: number = 0;

    constructor(origin: Vector, v: Vector, private life:number = 1.25) {
        super(origin.x, origin.y);
        this.velocity = v;
    }

    render(screen: Screen) {
        this.draw(screen);   
    }

    update(dt: number) {
        this.frame++;
        this.move(dt);
        this.life -= dt;

        if (this.life <= 0) {
            this.destroy();
        }
    }

    draw(screen: Screen) {
        let size = this.frame <= 1 ? 8 * OBJECT_SCALE : 4 * OBJECT_SCALE;
        screen.draw.rect(this.origin.x - 2, this.origin.y - 2, size, size, `rgba(255,0,255,.5)`);
        screen.draw.rect(this.origin.x - 1, this.origin.y - 1, size, size, `rgba(0,255,255,.5)`);
        screen.draw.rect(this.origin.x, this.origin.y, size, size);
    }

    destroy() {
        this.trigger('expired');
    }

    get vertices(): Point[] {
        return [this.origin];
    }
}