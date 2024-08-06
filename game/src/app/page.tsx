"use client";
import { Button } from "@/components/button";
import { Game } from "@/components/game";
import { PastGames } from "@/components/past-games/past-games";
import { fetchLeaderboard, fetchMruInfo } from "@/rpc/api";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";

export default function Main() {
  const { isConnecting } = useAccount();
  const { login, user, ready } = usePrivy();
  const { connectors } = useConnect();

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const setupGame = async () => {
      setLoading(true);
      await Promise.all([fetchMruInfo(), fetchLeaderboard()]);
      setLoading(false);
    };
    setupGame();
  }, [connectors]);

  const connectWallet = async () => {
    login();
  };

  const renderContinueButton = () => {
    const text = isConnecting ? "Connecting Wallet..." : "Connect Wallet";
    return (
      <div className="flex flex-col justify-center w-fit">
        <Button isDisabled={isConnecting} onClick={connectWallet}>
          {text}
        </Button>
        <div className="text-center mt-4">To play game</div>
      </div>
    );
  };

  if (isLoading || !ready) {
    return <div className="text-3xl w-full text-center">Loading Game...</div>;
  }

  return (
    <main>
      <div className="flex justify-center min-h-[70vh]">
        {user ? <Game /> : renderContinueButton()}
      </div>
      <br />
      <PastGames />
    </main>
  );
}
