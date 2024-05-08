import { useCallback } from "react";

import { services } from "@/scripts/background";
import { useLockStore } from "@/stores/lock";
import { useWalletStore } from "@/stores/wallet";

export const useReloadLockKey = () => {
  const { wallets } = useWalletStore((s) => s.wallet.nervosnetwork);
  const updateLock = useLockStore((s) => s.updateLock);

  return useCallback(async () => {
    try {
      const promises = wallets.map(async (wallet) => {
        if (wallet.type === "ledger") return { id: wallet.id, locked: false };
        const hasKeystore = await services.keyService.messagers.hasKeystore({ id: wallet.id });
        return { id: wallet.id, locked: !hasKeystore };
      });

      const locks = (await Promise.all(promises)).reduce(
        (acc, { id, locked }) => ({ ...acc, [id]: locked }),
        {} as Record<string, boolean>,
      );

      updateLock(locks);
    } catch (error) {
      console.error(error);
    }
  }, [updateLock, wallets]);
};
