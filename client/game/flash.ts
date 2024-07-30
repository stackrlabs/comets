import { Screen } from './screen';
import { EventSource } from './events';
import { IGameState } from '../comets';

export class Flash extends EventSource implements IGameState { 

    constructor(private frames: number) {
        super();
    }

    render(screen: Screen) {
        this.draw(screen);   
    }

    update(dt: number) {
        this.frames--;
        if (this.frames <= 0) {
            this.trigger('expired');
        }
    }

    draw(screen: Screen) {
        screen.draw.background('#ffffff');
        screen.draw.scanlines();
    }
    
}