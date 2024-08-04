"use client";
import { Button } from "@/components/button";
import { Game } from "@/components/game";
import { fetchLeaderboard, fetchMruInfo } from "@/rpc/api";
import { useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { addChain } from "viem/actions";
import { useAccount, useConnect } from "wagmi";
import { stackrDevnet } from "./config";

export default function Main() {
  const { isConnected, isConnecting } = useAccount();
  const { connectors, connect } = useConnect();

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const setupGame = async () => {
      setLoading(true);
      await Promise.all([fetchMruInfo(), fetchLeaderboard()]);
      const connector = connectors[0];
      await connector.getProvider();
      setLoading(false);
    };
    setupGame();
  }, [connectors]);

  const connectWallet = async () => {
    const connector = connectors[0];
    const chainId = await connector.getChainId();
    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    if (chainId !== stackrDevnet.id) {
      try {
        await walletClient.switchChain({ id: stackrDevnet.id });
      } catch (e) {
        console.log(e);
        await addChain(walletClient, { chain: stackrDevnet });
      }
    }
    connect({ connector });
  };

  const renderContinueButton = () => {
    return (
      <div className="flex flex-col justify-center">
        <Button onClick={connectWallet}>Connect Wallet</Button>
        <div className="text-center mt-4">To play game</div>
      </div>
    );
  };

  if (isLoading || isConnecting) {
    return <div className="text-3xl w-full text-center">Loading Game...</div>;
  }

  return <main>{isConnected ? <Game /> : renderContinueButton()}</main>;
}
