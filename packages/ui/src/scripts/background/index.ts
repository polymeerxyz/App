import { PrivateKeyCache } from "@/scripts/background/cache/key";
import { creatKeyService } from "@/scripts/background/key";
import { createTransactionService } from "@/scripts/background/transaction";

export const services = (() => {
  const ckbPrivateKeyCache = new PrivateKeyCache();

  const keyService = creatKeyService(ckbPrivateKeyCache);
  const transactionService = createTransactionService(ckbPrivateKeyCache);

  return {
    keyService,
    transactionService,
  } as const;
})();
