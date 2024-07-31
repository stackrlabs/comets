import { ActionSchema, SolidityType } from "@stackr/sdk";

export const StartGameSchema = new ActionSchema("startGame", {
  timestamp: SolidityType.UINT,
});

export const EndGameSchema = new ActionSchema("endGame", {
  gameId: SolidityType.UINT,
  timestamp: SolidityType.UINT, // nonce
  score: SolidityType.UINT,
  ticks: [
    {
      v: SolidityType.STRING,
    },
  ],
});
