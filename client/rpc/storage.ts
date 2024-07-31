export enum StorageKey {
  MRU_INFO = "mru_info",
  GAME_ID = "game_id",
}

export const addToStore = (key: StorageKey, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromStore = (key: StorageKey) => {
  return JSON.parse(localStorage.getItem(key));
};
