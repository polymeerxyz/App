import { ckb } from "@polymeerxyz/lib";
import { useCallback, useMemo, useState } from "react";

import { useActiveAddress } from "@/hooks/useActiveAddress";
import { useTransactionService } from "@/hooks/useLib";
import { SupportedToken } from "@/lib/models/token";

export const useTransactionList = () => {
  const [result, setResult] = useState<ckb.Transaction[]>([]);
  const { full: activeAddress } = useActiveAddress();
  const transactionService = useTransactionService();

  const fetch = useCallback(
    async (token: SupportedToken) => {
      if (token.id === "ckb") {
        const txs = await transactionService.current.listNativeTransaction(activeAddress);
        setResult(txs.reverse());
      } else if (token.xudtArgs) {
        const txs = await transactionService.current.listXUDTTransaction(activeAddress, token.xudtArgs!);
        setResult(txs.reverse());
      }
    },
    [activeAddress, transactionService],
  );

  return useMemo(() => ({ result, fetch }), [fetch, result]);
};
