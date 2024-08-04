import { sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const stackrDevnet = {
  ...sepolia,
  name: "Stackr Devnet",
  rpcUrls: {
    default: {
      http: ["https://devnet.stf.xyz"],
    },
  },
  id: 69420,
};

export function getConfig() {
  return createConfig({
    chains: [stackrDevnet],
    connectors: [injected({ shimDisconnect: true })],
    transports: {
      [stackrDevnet.id]: http(),
    },
  });
}
