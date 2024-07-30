import { ActionSchema, AllowedInputTypes, MicroRollup } from "@stackr/sdk";
import { HDNodeWallet, Wallet } from "ethers";
import { readFileSync } from "fs";
import { stackrConfig } from "./stackr.config";
import { CreateGameSchema, ValidateGameSchema } from "./stackr/action";
import { machine } from "./stackr/machine";

const wallet = new Wallet(stackrConfig.operator.accounts[0].privateKey);

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
    actionSchemas: [CreateGameSchema, ValidateGameSchema],
    stateMachines: [machine],
    stfSchemaMap: {
      createGame: CreateGameSchema,
      validateGame: ValidateGameSchema,
    },
  });

  await mru.init();

  const filePath = "./ticks.json";
  let jsonData;
  try {
    const data = readFileSync(filePath, "utf8");
    jsonData = JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing the file:", error);
    return null;
  }

  console.log("Found", jsonData.keypresses.length, "ticks");
  const inputs = {
    gameId: 1,
    ...jsonData,
  };

  const signature = await signMessage(wallet, ValidateGameSchema, inputs);
  const incrementAction = ValidateGameSchema.actionFrom({
    inputs,
    signature,
    msgSender: wallet.address,
  });

  const ack = await mru.submitAction("validateGame", incrementAction);
  // console.log(ack);
};

main();
