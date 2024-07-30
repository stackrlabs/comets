import { ActionSchema, AllowedInputTypes, MicroRollup } from "@stackr/sdk";
import { HDNodeWallet, Wallet } from "ethers";
import { stackrConfig } from "./stackr.config";
import { ValidateGameSchema } from "./stackr/action";
import { machine } from "./stackr/machine";
import { ValidateGameInput } from "./stackr/transitions";

const wallet = Wallet.createRandom();

const signMessage = async (
  wallet: HDNodeWallet,
  schema: ActionSchema,
  payload: AllowedInputTypes
) => {
  const signature = await wallet.signTypedData(
    schema.domain,
    schema.EIP712TypedData.types,
    payload
  );
  return signature;
};

const main = async () => {
  const mru = await MicroRollup({
    config: stackrConfig,
    actionSchemas: [ValidateGameSchema],
    stateMachines: [machine],
  });

  await mru.init();

  const filePath = './ticks2.json';
  const fs = require('fs').promises;

  let jsonData;

  try {
    const data = await fs.readFile(filePath, 'utf8');
    jsonData = JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
    return null;
  }

  console.log("Found", jsonData.length, "ticks")

  const inputs = {
    gameId: 1,
    timestamp: 1,
    inputs: jsonData,
  };

  const signature = await signMessage(wallet, ValidateGameSchema, inputs);
  const incrementAction = ValidateGameSchema.actionFrom({
    inputs,
    signature,
    msgSender: wallet.address,
  });

  const ack = await mru.submitAction("validateGame", incrementAction);
  console.log(ack);
};

main();
