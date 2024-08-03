import { getAddress } from "viem";
import { addToStore, getFromStore, StorageKey } from "./storage";
import { getWalletClient } from "./wallet";

const API_URL = "https://api.comets.stf.xyz";

const fetchMruInfo = async () => {
  const response = await fetch(`${API_URL}/info`);
  const res = await response.json();
  addToStore(StorageKey.MRU_INFO, res);
};

const fetchLeaderboard = async () => {
  const response = await fetch(`${API_URL}/leaderboard`);
  const res = await response.json();
  addToStore(StorageKey.LEADERBOARD, res);
};

const submitAction = async (transition: string, inputs: any) => {
  const walletClient = await getWalletClient();
  if (!walletClient?.account) {
    return;
  }

  const mruInfo = getFromStore(StorageKey.MRU_INFO);
  const { domain, schemas } = mruInfo;
  const msgSender = getAddress(walletClient.account.address);

  let signature;
  try {
    signature = await walletClient.signTypedData({
      domain,
      primaryType: schemas[transition].primaryType,
      types: schemas[transition].types,
      message: inputs,
      account: msgSender,
    });
  } catch (e) {
    console.error("Error signing message", e);
    return;
  }

  const response = await fetch(`${API_URL}/${transition}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      signature,
      msgSender,
    }),
  });

  return response.json();
};

const endGame = async (inputs: any) => {
  await submitAction("endGame", inputs);
};

const startGame = async () => {
  const inputs = { timestamp: Date.now() };
  const res = await submitAction("startGame", inputs);
  return res;
};

export { endGame, fetchLeaderboard, fetchMruInfo, startGame };
