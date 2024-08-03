import { Rect } from "../comets";

export const WIDTH = 960;
export const HEIGHT = 720;
export const OBJECT_SCALE = 0.75;
export const OFF_RECT = 120 * OBJECT_SCALE;
export const SHIP_RECT: Rect = {
  x: WIDTH / 2 - OFF_RECT,
  y: HEIGHT / 2 - OFF_RECT,
  width: OFF_RECT * 2,
  height: OFF_RECT * 2,
};