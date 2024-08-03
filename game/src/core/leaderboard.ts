import { fetchLeaderboard } from "@/rpc/api";
import { getFromStore, StorageKey } from "../rpc/storage";

class Leaderboard {
  constructor() {}

  async refresh() {
    await fetchLeaderboard();
  }

  get scores(): { score: number; address: string }[] {
    const data = getFromStore(StorageKey.LEADERBOARD);
    return data ? data : [];
  }

  get top() {
    return this.scores[0];
  }
}

const leaderboard = new Leaderboard();

export { leaderboard };
