import { endGame } from "../rpc/api";
import { VirtualInput } from "../comets";
import { Key } from "./keys";
import { getFromStore, StorageKey } from "../rpc/storage";
import { ACTIONS } from "./gameMode";

export class TickRecorder {
  public ticks: VirtualInput[] = [];

  serializedTicks(): { v: string }[] {
    return this.ticks.map((input) => {
      return {
        v: ACTIONS.map((action) => {
          return input[action] ? "1" : "0";
        }).join(""),
      };
    });
  }

  public collectInputs(): VirtualInput {
    const inputMap: VirtualInput = {};
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
