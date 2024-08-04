import { submitAction } from "@/rpc/api";
import { getFromStore, StorageKey } from "@/rpc/storage";
import { getAddress } from "viem";
import { useAccount, useSignTypedData } from "wagmi";

export const useAction = () => {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  if (!address) {
    throw new Error("No address found");
  }

  const mruInfo = getFromStore(StorageKey.MRU_INFO);
  const { domain, schemas } = mruInfo;
  const msgSender = getAddress(address);

  const submit = async (transition: string, inputs: any) => {
    let signature;
    try {
      signature = await signTypedDataAsync({
        domain,
        primaryType: schemas[transition].primaryType,
        types: schemas[transition].types,
        message: inputs,
        account: msgSender,
      });
    } catch (e) {
      console.error("Error signing message", e);
      return;
    }

    return submitAction(transition, {
      inputs,
      signature,
      msgSender,
    });
  };

  return { submit };
};
