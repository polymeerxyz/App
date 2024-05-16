import { useMemo } from "react";

import { useNetworkStore } from "@/stores/network";

export const useGetExplorerLink = (id = "", type: "address" | "transaction" | "xudt") => {
  const { type: networkType } = useNetworkStore((s) => s.config.nervosnetwork);
  return useMemo(() => {
    if (!id) {
      if (networkType === "mainnet") return `https://explorer.nervos.org`;
      else return `https://pudge.explorer.nervos.org`;
    }

    if (type === "address") {
      if (networkType === "mainnet") return `https://explorer.nervos.org/address/${id}`;
      else return `https://pudge.explorer.nervos.org/address/${id}`;
    } else if (type === "transaction") {
      if (networkType === "mainnet") return `https://explorer.nervos.org/transaction/${id}`;
      else return `https://pudge.explorer.nervos.org/transaction/${id}`;
    } else {
      if (networkType === "mainnet") return `https://explorer.nervos.org/xudt/${id}`;
      else return `https://pudge.explorer.nervos.org/xudt/${id}`;
    }
  }, [id, networkType, type]);
};
