"use client";

import { useState, type ReactNode } from "react";

import { PrivyProvider } from "@privy-io/react-auth";
import { sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getConfig } from "./config";
import { WagmiProvider } from "@privy-io/wagmi";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          logo: "https://comets.stf.xyz/icon.png",
        },
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: "all",
          },
        },
        defaultChain: sepolia,
        supportedChains: [sepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
