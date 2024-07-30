import { Key } from "./keys";

export class TickRecorder {
  public ticks: { [key: string]: boolean }[] = [];

  public collectInputs() {
    const inputMap: { [key: string]: boolean } = {};
    if (Key.isThrust()) {
      inputMap["isThrust"] = true;
    }

    if (Key.wasRotateLeft) {
      inputMap["wasRotateLeft"] = true;
    }

    if (Key.isRotateLeft()) {
      inputMap["isRotateLeft"] = true;
    }

    if (Key.wasRotateRight) {
      inputMap["wasRotateRight"] = true;
    }

    if (Key.isRotateRight()) {
      inputMap["isRotateRight"] = true;
    }

    if (Key.isFire()) {
      inputMap["isFire"] = true;
    }

    if (Key.wasHyperspace()) {
      inputMap["wasHyperspace"] = true;
    }

    this.ticks.push(inputMap);
  }

  public sendTicks() {
    console.log(`Found about ${this.ticks.length} ticks to send`);
    this.ticks = [];
  }
}
