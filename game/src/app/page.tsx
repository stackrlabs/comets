"use client";
import { Game } from "@/components/game";
import { fetchLeaderboard, fetchMruInfo } from "@/rpc/api";
import { useEffect, useState } from "react";

export default function Comets() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const setupGame = async () => {
      setLoading(true);
      await Promise.all([fetchMruInfo(), fetchLeaderboard()]);
      setLoading(false);
    };
    setupGame();
  }, []);

  if (isLoading) {
    return (
      <div className="text-3xl text-white w-full text-center">
        Loading Game...
      </div>
    );
  }

  return (
    <main>
      <Game />
    </main>
  );
}
