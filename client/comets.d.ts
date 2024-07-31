import {Screen} from './game/screen';

interface IGameState {
  update: (step: number, inputs?: VirtualInput) => void;
  render: (screen: Screen, dt?: number) => void;
}

type VirtualInput = { [key: string]: boolean };

interface Point {
    x: number,
    y: number
}

interface Rect extends Point {
    width: number;
    height: number;
}

interface IQuadtree {
    nodes: IQuadtree[];
    objects: Rect[];
    width2: number;
    height2: number;
    xmid: number;
    ymid: number;
}

