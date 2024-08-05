import { sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [sepolia],
    connectors: [injected({ shimDisconnect: true })],
    transports: {
      [sepolia.id]: http(),
    },
  });
}
