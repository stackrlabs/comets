import { createWalletClient, custom, WalletClient } from "viem";
import { sepolia } from "viem/chains";
import { getFromStore, StorageKey } from "./storage";

let walletClient: any;

const addChainIfMissing = async (walletClient: WalletClient) => {
  const mruInfo = getFromStore(StorageKey.MRU_INFO);
  const { domain, rpcUrls } = mruInfo;

  const currentChainId = await walletClient.getChainId();
  const domainChainId = domain.chainId;
  const chain = {
    ...sepolia,
    name: "Stackr Devnet",
    rpcUrls: {
      default: {
        http: rpcUrls,
      },
    },
    id: domainChainId,
  };
  if (currentChainId !== chain.id) {
    try {
      await walletClient.switchChain({ id: chain.id });
    } catch (e) {
      console.log(e);
      await walletClient.addChain({
        chain,
      });
    }
  }
};

export const getWalletClient = async (): Promise<WalletClient | undefined> => {
  const eth = (window as any).ethereum;
  if (eth == null) {
    console.log("Wallet injector not installed; using read-only defaults");
  } else {
    if (walletClient) {
      return walletClient;
    }

    const [account] = await eth.request({
      method: "eth_requestAccounts",
    });

    walletClient = createWalletClient({
      account,
      transport: custom(eth),
    });

    await addChainIfMissing(walletClient);

    console.log(`Connected to wallet ${account}`);
    return walletClient;
  }
};
