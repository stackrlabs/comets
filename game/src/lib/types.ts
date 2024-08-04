import { BlockStatus, DA } from "./constants";

export interface Schema {
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
}

export interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
  salt: `0x${string}`;
}

export interface MRUInfo {
  signingInstructions: string;
  domain: Domain;
  transitionToSchema: Record<string, string>;
  schemas: {
    [key: string]: Schema;
  };
}

export type AllowedInputTypes = Record<
  string,
  string | number | boolean | Array<string | number | boolean>
>;

export type DAMetadata = Record<
  DA,
  {
    blockHeight: number;
    extIdx?: number;
    txHash?: string;
    commitment?: string;
  }
>;

export interface GameAction {
  gameId: string;
  score: number;
  hash: string;
  player: string;
  blockInfo: {
    status: BlockStatus;
    daMetadata: DAMetadata;
    l1TxHash: string | null;
  } | null;
}
