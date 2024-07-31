import { getAddress } from "viem";
import { addToStore, getFromStore, StorageKey } from "./storage";
import { getWalletClient } from "./wallet";

const API_URL = "http://localhost:3210";

const fetchMruInfo = async () => {
  const response = await fetch(`${API_URL}/info`);
  const res = await response.json();
  addToStore(StorageKey.MRU_INFO, res);
};

const submitAction = async (transition: string, inputs: any) => {
  const walletClient = await getWalletClient();
  const mruInfo = getFromStore(StorageKey.MRU_INFO);
  const { domain, schemas } = mruInfo;
  const msgSender = getAddress(walletClient.account.address);

  const signature = await walletClient.signTypedData({
    domain,
    primaryType: schemas[transition].primaryType,
    types: schemas[transition].types,
    message: inputs,
    account: msgSender,
  });

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
  return submitAction("endGame", inputs);
};

const startGame = async () => {
  const inputs = { timestamp: Date.now() };
  const res = await submitAction("startGame", inputs);
  return res;
};

export { endGame, startGame, fetchMruInfo };
