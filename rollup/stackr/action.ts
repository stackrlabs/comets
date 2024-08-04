import { ActionSchema, SolidityType } from "@stackr/sdk";

export const StartGameSchema = new ActionSchema("startGame", {
  timestamp: SolidityType.UINT,
  width: SolidityType.UINT,
  height: SolidityType.UINT,
});

export const EndGameSchema = new ActionSchema("endGame", {
  gameId: SolidityType.UINT,
  timestamp: SolidityType.UINT, // nonce
  score: SolidityType.UINT,
  gameInputs: SolidityType.STRING,
});
