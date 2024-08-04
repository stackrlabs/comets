"use client";
import { stackrDevnet } from "@/app/config";
import { formatAddress } from "@/core/highScoreMode";
import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "./button";

export const Navbar = () => {
  const { address, chainId } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (chainId !== stackrDevnet.id) {
      disconnect();
    }
  }, [chainId]);

  return (
    <nav className="sm:px-2 lg:px-10 md:px-8 py-4 ">
      <div className="flex justify-between items-center">
        <div className="text-2xl p-2 lg:px-4 select-none">Comets</div>
        {!!address && (
          <div className="flex flex-wrap gap-4 text-center items-center">
            <div>{formatAddress(address)}</div>
            <Button onClick={() => disconnect()}>Disconnect</Button>
          </div>
        )}
      </div>
    </nav>
  );
};
