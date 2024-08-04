import { IGameState } from "../comets";
import { getFromStore, StorageKey } from "../rpc/storage";
import { GameMode } from "./gameMode";
import { KeyManager } from "./keys";
import { MainPage } from "./mainPage";
import { Screen } from "./screen";
import { Sound } from "./sounds";
import { TickRecorder } from "./tickRecorder";
import { World } from "./world";

export class Comets {
  private lastScore = 0;
  private mainPage!: MainPage;
  private gameMode!: GameMode;
  private currentMode!: IGameState;
  private tickRecorder!: TickRecorder;
  private screen!: Screen;
  private keyManager!: KeyManager;
  private gameEndHandler: (score: number) => Promise<void>;
  private handleStartGame: () => Promise<number | undefined>;

  constructor(
    keyManager: KeyManager,
    tickRecorder: TickRecorder,
    gameEndHandler: (score: number) => Promise<void>,
    handleStartGame: () => Promise<number | undefined>
  ) {
    this.keyManager = keyManager;
    this.tickRecorder = tickRecorder;
    this.gameEndHandler = gameEndHandler;
    this.handleStartGame = handleStartGame;
    this.init();
  }

  onStartGame = () => {
    const gameId = getFromStore(StorageKey.GAME_ID);
    this.tickRecorder.reset();
    this.gameMode = new GameMode(new World(), {
      tickRecorder: this.tickRecorder,
      gameId,
    });

    this.currentMode = this.gameMode;

    this.gameMode.on("done", (_, world) => {
      Sound.off();
      this.gameEndHandler(world.score);
    });
  };

  switchToMainPage() {
    this.mainPage = new MainPage(
      this.keyManager,
      this.lastScore,
      this.handleStartGame
    );
    this.mainPage.on("done", () => {
      console.debug("Start Game");
      this.onStartGame();
    });

    this.currentMode = this.mainPage;
  }

  init() {
    this.screen = new Screen();
    this.switchToMainPage();
  }

  update(dt: number) {
    const gameInputs = this.tickRecorder.collectInputs();
    this.currentMode.update(dt, gameInputs);
  }

  render(dt: number) {
    this.currentMode.render(this.screen, dt);
    this.keyManager.update();
  }
}
