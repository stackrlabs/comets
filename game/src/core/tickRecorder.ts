import { VirtualInput } from "../comets";
import { endGame } from "../rpc/api";
import { getFromStore, StorageKey } from "../rpc/storage";
import { ACTIONS } from "./gameMode";
import { KeyManager } from "./keys";

export class TickRecorder {
  public ticks: VirtualInput[] = [];
  private keyManager: KeyManager;
  constructor(keyManager: KeyManager) {
    this.keyManager = keyManager;
  }

  serializedTicks(): string {
    return this.ticks
      .map((input) => {
        return ACTIONS.map((action) => (input[action] ? "1" : "0"));
      })
      .map((tick) => parseInt(tick.join(""), 2))
      .join(",");
  }

  public collectInputs(): VirtualInput {
    const inputMap: VirtualInput = {};
    if (this.keyManager.isThrust()) {
      inputMap["isThrust"] = true;
    }

    if (this.keyManager.wasRotateLeft()) {
      inputMap["wasRotateLeft"] = true;
    }

    if (this.keyManager.isRotateLeft()) {
      inputMap["isRotateLeft"] = true;
    }

    if (this.keyManager.wasRotateRight()) {
      inputMap["wasRotateRight"] = true;
    }

    if (this.keyManager.isRotateRight()) {
      inputMap["isRotateRight"] = true;
    }

    if (this.keyManager.isFire()) {
      inputMap["isFire"] = true;
    }

    if (this.keyManager.wasHyperspace()) {
      inputMap["wasHyperspace"] = true;
    }

    return inputMap;
  }

  public recordInputs(inputs: VirtualInput) {
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
      gameInputs: this.serializedTicks(),
    };

    await endGame(payload);
  }
}
