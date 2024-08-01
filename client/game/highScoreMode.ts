import { IGameState } from "../comets";
import { Highscores } from "./highscores";
import { Screen } from "./screen";
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export class HighScoreMode implements IGameState {
  blink: number = 0;
  showPushStart: boolean = true;

  constructor(private score) {}

  update(dt) {
    this.blink += dt;

    if (this.blink >= 0.4) {
      this.blink = 0;
      this.showPushStart = !this.showPushStart;
    }
  }

  render(screen: Screen, delta: number) {
    this.drawBackground(screen);
    this.drawPushStart(screen);
    this.drawHighScores(screen);
  }

  private drawBackground(screen: Screen) {
    screen.draw.background();
    screen.draw.stackr();
    screen.draw.scorePlayer1(this.score);
    screen.draw.oneCoinOnePlay();
    screen.draw.copyright();
  }

  private drawHighScores(screen: Screen) {
    const screenX = screen.width / 2;
    const startY =
      Math.ceil(screen.height / 4.5) + (screen.font.xlarge + screen.font.small);
    const spacing = screen.font.medium + screen.font.small;

    screen.draw.text2("Leaderboard", screen.font.large, (width) => {
      return {
        x: screenX - width / 2,
        y: screen.height / 4.5,
      };
    });

    if (Highscores.scores.length === 0) {
      screen.draw.text2("not enough data", screen.font.medium, (width) => {
        return {
          x: screenX - width / 2,
          y: startY,
        };
      });
      return;
    }

    for (let i = 0; i < Highscores.scores.length; i++) {
      const y = startY + i * spacing;
      const text = `${this.pad(i + 1, " ", 2)}.${this.pad(
        formatAddress(Highscores.scores[i].address),
        " ",
        6
      )} ${this.pad(Highscores.scores[i].score, " ", 8)}`;

      screen.draw.text2(text, screen.font.large, (width) => {
        return {
          x: screenX - width / 2,
          y: y,
        };
      });
    }
  }

  private drawPushStart(screen: Screen) {
    if (this.showPushStart) {
      screen.draw.pushStart();
    }
  }

  private pad(text: any, char: string, count: number) {
    text = text.toString();
    while (text.length < count) {
      text = char + text;
    }
    return text;
  }
}
