import { ActionBatcher } from './actionBatcher';

const timestamp = () => {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

let now: number;
let delta = 0;
let last = timestamp();
let elapsedTime = 0;

const DT = 1/60;
const ONE_SECOND = 1000;

const init = (state: IGameState, actionBatcher: ActionBatcher) => {

    const frame = () => {
        now = timestamp();
        delta += Math.min(1, (now - last) / ONE_SECOND);
        elapsedTime += now - last;
        
        while(delta > DT) {
            // Every time we update world state, we also update the Input Tracker
            state.update(DT);
            actionBatcher.collectInputs();
            delta -= DT;
        }

        state.render(delta);

        if (elapsedTime > ONE_SECOND) {
            elapsedTime -= ONE_SECOND;
            console.log(`A second has passed`);
            actionBatcher.sendActions()
        }

        last = now;
        
        requestAnimationFrame(frame);        
    }

    frame();
}

export const loop = (state: IGameState) => {
    const actionBatcher = new ActionBatcher();
    init(state, actionBatcher);
}





