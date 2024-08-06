"use client";
import { formatAddress } from "@/core/highScoreMode";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./button";

export const Navbar = () => {
  const { logout, user } = usePrivy();

  return (
    <nav className="sm:px-2 lg:px-10 md:px-8 py-4 ">
      <div className="flex justify-between items-center">
        <div className="text-2xl p-2 lg:px-4 select-none">Comets</div>
        {!!user?.wallet?.address && (
          <div className="flex flex-wrap gap-4 text-center items-center">
            <div>{formatAddress(user.wallet?.address)}</div>
            <Button onClick={() => logout()}>Disconnect</Button>
          </div>
        )}
      </div>
    </nav>
  );
};
