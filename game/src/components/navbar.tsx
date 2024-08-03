"use client";
import { getWalletClient } from "@/rpc/wallet";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const client = await getWalletClient();
      setUser(client?.account?.address || "...");
    })();
  }, []);

  return (
    <nav className="p-6 text-white">
      <div className="flex justify-between items-center">
        <div className="text-2xl">Comets</div>
        <div>{!user ? <button>Connect Wallet</button> : user}</div>
      </div>
    </nav>
  );
};
