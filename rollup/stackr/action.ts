import { ActionSchema, SolidityType } from "@stackr/sdk";

export const CreateGameSchema = new ActionSchema("createGame", {
  timestamp: SolidityType.UINT,
});

export const ValidateGameSchema = new ActionSchema("validateGame", {
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
