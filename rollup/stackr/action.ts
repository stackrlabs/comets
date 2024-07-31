import { ActionSchema, SolidityType } from "@stackr/sdk";

export const StartGameSchema = new ActionSchema("startGame", {
  timestamp: SolidityType.UINT,
});

export const EndGameSchema = new ActionSchema("endGame", {
  gameId: SolidityType.UINT,
  timestamp: SolidityType.UINT, // nonce
  score: SolidityType.UINT,
  keypresses: [
    { wasHyperspace: SolidityType.BOOL },
    { isRotateLeft: SolidityType.BOOL },
    { wasRotateLeft: SolidityType.BOOL },
    { isRotateRight: SolidityType.BOOL },
    { wasRotateRight: SolidityType.BOOL },
    { isThrust: SolidityType.BOOL },
    { isFire: SolidityType.BOOL },
  ],
});
