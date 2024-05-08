import { PrivateKeyCache } from "@/scripts/background/cache/key";
import { createRuntimeService } from "@/scripts/base";

export const createTransactionService = (privateKeyCache: PrivateKeyCache) => {
  return createRuntimeService({
    name: "transaction",
    listeners: {},
  });
};
