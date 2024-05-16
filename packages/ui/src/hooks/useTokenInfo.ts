import { useCallback, useMemo, useState } from "react";

import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTransactionList } from "@/hooks/useTransactionList";
import { useTokenStore } from "@/stores/token";

export const useTokenInfo = (id: string, withTransactions = false) => {
  const [loading, setLoading] = useState(false);
  const tokens = useTokenStore((s) => s.getTokens("nervosnetwork", true));

  const { fetch: fetchBalance, result: balance } = useTokenBalance();
  const { fetch: fetchTransactionList, result: transactions } = useTransactionList();

  const token = useMemo(() => tokens.find((el) => el.id === id), [id, tokens]);

  const fetch = useCallback(() => {
    if (!token || loading) return;

    try {
      setLoading(true);
      fetchBalance(token);
      withTransactions && fetchTransactionList(token);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [fetchBalance, fetchTransactionList, loading, token, withTransactions]);

  return useMemo(
    () => ({
      balance,
      fetch,
      token,
      transactions,
    }),
    [balance, fetch, token, transactions],
  );
};
