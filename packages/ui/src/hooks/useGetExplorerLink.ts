import { useMemo } from "react";

import { useNetworkStore } from "@/stores/network";

export const useGetExplorerLink = (id: string, type: "address" | "transaction") => {
  const { type: networkType } = useNetworkStore((s) => s.config.nervosnetwork);
  return useMemo(() => {
    if (type === "address") {
      if (networkType === "mainnet") return `https://explorer.nervos.org/address/${id}`;
      else return `https://pudge.explorer.nervos.org/address/${id}`;
    } else {
      if (networkType === "mainnet") return `https://explorer.nervos.org/transaction/${id}`;
      else return `https://pudge.explorer.nervos.org/transaction/${id}`;
    }
  }, [id, networkType, type]);
};
