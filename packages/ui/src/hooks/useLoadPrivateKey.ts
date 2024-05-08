import { useCallback } from "react";

import { services } from "@/scripts/background";
import { useAddressStore } from "@/stores/address";
import { useWalletStore } from "@/stores/wallet";

export const useLoadPrivateKey = () => {
  const { addressType, index } = useAddressStore((s) => s.getAddressInfo("nervosnetwork"));
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));

  return useCallback(async () => {
    return await services.keyService.messagers.getPrivateKey({ id: activeWallet!.id, addressType, index });
  }, [activeWallet, addressType, index]);
};
