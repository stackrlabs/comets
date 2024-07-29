import { Key } from './keys';

export class ActionBatcher {
    public actions: { [key: string]: boolean }[] = [];

    public collectInputs() {
        const inputMap: { [key: string]: boolean } = {};
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
        // console.log(this.inputMap);
        this.actions.push(inputMap);
    }

    public sendActions() {
        console.log(`Found about ${this.actions.length} actions to send`);
        this.actions = [];
    }
}