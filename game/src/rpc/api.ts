import { addToStore, StorageKey } from "./storage";

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

const submitAction = async (transition: string, payload: any) => {
  const response = await fetch(`${API_URL}/${transition}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
};

export { fetchLeaderboard, fetchMruInfo, submitAction };
