import { Key } from './keys';
import { VirtualInputs } from '../comets';

export class TickRecorder {
    public ticks: VirtualInputs[] = [];

    public collectInputs(): VirtualInputs {
        const inputMap: VirtualInputs = {};
        if (Key.isThrust()) {
            inputMap['isThrust'] = true;
        }

        if (Key.wasRotateLeft) {
            inputMap['wasRotateLeft'] = true;
        } 

        if (Key.isRotateLeft()) {
            inputMap['isRotateLeft'] = true;
        } 

        if (Key.wasRotateRight) {
            inputMap['wasRotateRight'] = true;
        }

        if (Key.isRotateRight()) {
            inputMap['isRotateRight'] = true;
        } 

        if (Key.isFire()) {
            inputMap['isFire'] = true; 
        }

        if (Key.wasHyperspace()) {
            inputMap['wasHyperspace'] = true; 
        }

        return inputMap
    }

    public recordInputs(inputs: VirtualInputs) {
        this.ticks.push(inputs);
    }

    public reset() {
        this.ticks = [];
    }

    public sendTicks() {
        console.log(`Found about ${this.ticks.length} ticks to send`);
    }
}