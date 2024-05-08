import { useCallback } from "react";

import { services } from "@/scripts/background";
import { useLockStore } from "@/stores/lock";

export const useUnlockPrivateKey = () => {
  const updateLock = useLockStore((s) => s.updateLock);

  return useCallback(
    async (id: string, password: string) => {
      try {
        await services.keyService.messagers.loadKeystore({ id, password });
        updateLock({ [id]: false });
      } catch (error) {
        console.error(error);
        updateLock({ [id]: true });
      }
    },
    [updateLock],
  );
};
