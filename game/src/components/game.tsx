"use client";
import { Comets } from "@/core/comets";
import { init } from "@/core/loop";
import { useEffect } from "react";

export const Game = () => {
  useEffect(() => {
    const game = new Comets();
    const tick = setTimeout(() => {
      init(game);
    }, 1000);

    return () => {
      if (tick) {
        clearTimeout(tick);
      }
    };
  }, []);

  return (
    <div id="game">
      <canvas id="canvas"></canvas>
    </div>
  );
};
