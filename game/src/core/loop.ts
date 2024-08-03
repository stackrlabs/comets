"use client";
import { Comets } from "./comets";

const timestamp = () => {
  return new Date().getTime();
};

let now: number;
let delta = 0;
let last = timestamp();

const DT = 1 / 60;
const ONE_SECOND = 1000;

export const init = (state: Comets) => {
  const frame = () => {
    now = timestamp();
    delta += Math.min(1, (now - last) / ONE_SECOND);

    while (delta > DT) {
      state.update(DT);
      delta -= DT;
    }

    state.render(delta);
    last = now;
    requestAnimationFrame(frame);
  };

  frame();
};
