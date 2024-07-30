import { Rect } from "../comets";

export const WIDTH: number = 960;
export const HEIGHT: number = 720;
export const OBJECT_SCALE: number = 0.75;
export const OFF_RECT: number = 120 * OBJECT_SCALE;
export const SHIP_RECT: Rect = {
  x: WIDTH / 2 - OFF_RECT,
  y: HEIGHT / 2 - OFF_RECT,
  width: OFF_RECT * 2,
  height: OFF_RECT * 2,
};
