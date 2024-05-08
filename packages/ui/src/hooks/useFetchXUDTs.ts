import axios from "axios";
import { useCallback } from "react";

import { SupportedChain, SupportedToken } from "@/lib/models/token";
import { useNetworkStore } from "@/stores/network";
import { useTokenStore } from "@/stores/token";

export const useFetchXUDTs = () => {
  const { type } = useNetworkStore((s) => s.config.nervosnetwork);
  const updateTokens = useTokenStore((s) => s.updateTokens);

  return useCallback(
    async (chain: SupportedChain) => {
      const { data } = await axios.get<SupportedToken[]>(
        `https://raw.githubusercontent.com/polymeerxyz/app/main/packages/token/resources/${chain}/${type}/token.json?timestamp=${Date.now()}`,
      );
      updateTokens(chain, data);
    },
    [type, updateTokens],
  );
};
