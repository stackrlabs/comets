import { ActionSchema, SolidityType } from "@stackr/sdk";

export const ValidateGameSchema = new ActionSchema("validateGame", {
  gameId: SolidityType.UINT,
  timestamp: SolidityType.UINT, // nonce
  // Keypresses mapped to action inputs
  inputs: [
    {wasHyperspace: SolidityType.BOOL},
    {isRotateLeft: SolidityType.BOOL},
    {wasRotateLeft: SolidityType.BOOL},
    {isRotateRight: SolidityType.BOOL},
    {wasRotateRight: SolidityType.BOOL},
    {isThrust: SolidityType.BOOL},
    {isFire: SolidityType.BOOL},
  ],
});
