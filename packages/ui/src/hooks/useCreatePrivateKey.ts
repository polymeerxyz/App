import { useCallback } from "react";

import { services } from "@/scripts/background";

export const useCreatePrivateKey = () => {
  return useCallback(async (mnemonic: string, password: string) => {
    return await services.keyService.messagers.saveKeystore({ mnemonic, password });
  }, []);
};
