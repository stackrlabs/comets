"use client";
import { Button } from "@/components/button";
import { Game } from "@/components/game";
import { PastGames } from "@/components/past-games/past-games";
import { fetchLeaderboard, fetchMruInfo } from "@/rpc/api";
import { useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { addChain } from "viem/actions";
import { sepolia } from "viem/chains";
import { useAccount, useConnect } from "wagmi";

export default function Main() {
  const { isConnected, isConnecting } = useAccount();
  const { connectors, connect } = useConnect();

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const setupGame = async () => {
      setLoading(true);
      await Promise.all([fetchMruInfo(), fetchLeaderboard()]);
      setLoading(false);
      const connector = connectors[0];
      await connector.getProvider();
    };
    setupGame();
  }, [connectors]);

  const connectWallet = async () => {
    const connector = connectors[0];
    const chainId = await connector.getChainId();
    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    if (chainId !== sepolia.id) {
      try {
        await walletClient.switchChain({ id: sepolia.id });
      } catch (e) {
        console.log(e);
        await addChain(walletClient, { chain: sepolia });
      }
    }
    connect({ connector });
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

  if (isLoading) {
    return <div className="text-3xl w-full text-center">Loading Game...</div>;
  }

  return (
    <main>
      <div className="flex justify-center min-h-[70vh]">
        {isConnected ? <Game /> : renderContinueButton()}
      </div>
      <br />
      <PastGames />
    </main>
  );
}
