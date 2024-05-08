import { useCallback, useEffect, useMemo, useState } from "react";

import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTransactionList } from "@/hooks/useTransactionList";
import { SupportedToken } from "@/lib/models/token";
import { useTokenStore } from "@/stores/token";

export const useTokenInfo = (address: string, withTransactions = false) => {
  const [token, setToken] = useState<SupportedToken>();
  const { tokens, native } = useTokenStore((s) => s.token.nervosnetwork);

  const { fetch: fetchBalance, result: balance } = useTokenBalance();
  const { fetch: fetchTransactionList, result: transactions } = useTransactionList();

  const refresh = useCallback(
    (info: SupportedToken) => {
      fetchBalance(info);
      withTransactions && fetchTransactionList(info);
    },
    [fetchBalance, fetchTransactionList, withTransactions],
  );

  useEffect(() => {
    const info = [native, ...tokens].find((el) => el.address === address);
    if (!info) return;

    setToken(info);
    refresh(info);
  }, [address, native, refresh, tokens]);

  return useMemo(
    () => ({
      balance,
      refresh,
      token,
      transactions,
    }),
    [balance, refresh, token, transactions],
  );
};
