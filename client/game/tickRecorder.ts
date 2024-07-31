import { endGame } from "../rpc/api";
import { VirtualInputs } from "../comets";
import { Key } from "./keys";
import { getFromStore, StorageKey } from "../rpc/storage";

export class TickRecorder {
  public ticks: VirtualInputs[] = [];

  public collectInputs(): VirtualInputs {
    const inputMap: VirtualInputs = {};
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

    return inputMap;
  }

  public recordInputs(inputs: VirtualInputs) {
    this.ticks.push(inputs);
  }

  public reset() {
    this.ticks = [];
  }

  async sendTicks(score: number) {
    console.log(
      `Sending ${this.ticks.length} ticks and score ${score} to MRU...`
    );
    const payload = {
      gameId: getFromStore(StorageKey.GAME_ID),
      timestamp: Date.now(),
      score,
      keypresses: this.ticks,
    };

    await endGame(payload);
  }
}
