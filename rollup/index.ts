import { ActionSchema, AllowedInputTypes, MicroRollup } from "@stackr/sdk";
import { HDNodeWallet, Wallet } from "ethers";
import { stackrConfig } from "./stackr.config";
import { TickActionSchema } from "./stackr/action";
import { machine } from "./stackr/machine";

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
    actionSchemas: [TickActionSchema],
    stateMachines: [machine],
  });

  await mru.init();

  // const inputs = {
  //   timestamp: Date.now(),
  // };

  // const signature = await signMessage(wallet, TickActionSchema, inputs);
  // const incrementAction = TickActionSchema.actionFrom({
  //   inputs,
  //   signature,
  //   msgSender: wallet.address,
  // });

  // const ack = await mru.submitAction("increment", incrementAction);
  // console.log(ack);
};

main();
