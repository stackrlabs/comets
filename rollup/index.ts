import {
  ActionConfirmationStatus,
  ActionSchema,
  AllowedInputTypes,
  MicroRollup,
} from "@stackr/sdk";
import { HDNodeWallet, Wallet } from "ethers";
import express from "express";
import { readFileSync } from "fs";
import { stackrConfig } from "./stackr.config";
import { StartGameSchema, EndGameSchema } from "./stackr/action";
import { machine, MACHINE_ID } from "./stackr/machine";

const PORT = process.env.PORT || 3210;
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

const stfSchemaMap: Record<string, ActionSchema> = {
  startGame: StartGameSchema,
  endGame: EndGameSchema,
};

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [StartGameSchema, EndGameSchema],
  stateMachines: [machine],
  stfSchemaMap,
});

const notMain = async () => {
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

  const signature = await signMessage(wallet, EndGameSchema, inputs);
  const incrementAction = EndGameSchema.actionFrom({
    inputs,
    signature,
    msgSender: wallet.address,
  });

  const ack = await mru.submitAction("endGame", incrementAction);
  // console.log(ack);
};

const main = async () => {
  await mru.init();

  const app = express();
  app.use(express.json({ limit: "50mb" }));
  // allow CORS
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  const stateMachine = mru.stateMachines.get<typeof machine>(MACHINE_ID);
  if (!stateMachine) {
    throw new Error("State machine not found");
  }

  app.get("/", (_req, res) => {
    const { state } = stateMachine;
    return res.json(state);
  });

  app.get("/info", (_req: Request, res: Response) => {
    const transitionToSchema = mru.getStfSchemaMap();
    res.send({
      rpcUrls: [mru.config.L1RPC],
      signingInstructions: "signTypedData(domain, schema.types, inputs)",
      domain: mru.config.domain,
      transitionToSchema,
      schemas: [StartGameSchema, EndGameSchema].reduce((acc, schema) => {
        acc[schema.identifier] = {
          primaryType: schema.EIP712TypedData.primaryType,
          types: schema.EIP712TypedData.types,
        };
        return acc;
      }, {} as Record<string, any>),
    });
  });

  app.get("/leaderboard", async (_req, res) => {
    const { state } = stateMachine;
    const topTen = [...state.games]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const leaderboard = topTen.map((game) => ({
      address: game.player,
      score: game.score,
    }));

    return res.json(leaderboard);
  });

  const handleAction = async (
    transition: string,
    schema: ActionSchema,
    payload: any
  ) => {
    const action = schema.actionFrom(payload);
    const ack = await mru.submitAction(transition, action);
    const { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
    if (errors?.length) {
      throw new Error(errors[0].message);
    }
    return logs;
  };

  app.post("/:transition", async (req, res) => {
    const { transition } = req.params;
    const schema = stfSchemaMap[transition];

    const { inputs, signature, msgSender } = req.body;

    try {
      const logs = await handleAction(transition, schema, {
        inputs,
        signature,
        msgSender,
      });
      return res.json({
        isOk: true,
        logs,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ isOk: false, error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main();

// notMain();
