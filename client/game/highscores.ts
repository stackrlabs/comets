import { fetchLeaderboard } from "../rpc/api";
import { getFromStore, StorageKey } from "../rpc/storage";

class Highscores {
  constructor() {
    fetchLeaderboard();
  }

  get scores(): { score: number; address: string }[] {
    const data = getFromStore(StorageKey.LEADERBOARD);
    return data ? data : [];
  }

  get top() {
    return this.scores[0];
  }

  qualifies(score: number) {
    const less = highscores.scores.filter((x) => x.score < score);
    return !!less.length;
  }
}

const highscores = new Highscores();

export { highscores as Highscores };
