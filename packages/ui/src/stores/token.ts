import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { BaseToken, SupportedChain, SupportedToken } from "@/lib/models/token";

interface TokenState {
  token: Record<SupportedChain, { tokens: SupportedToken[]; native: BaseToken }>;
  updateTokens: (chain: SupportedChain, tokens: SupportedToken[]) => Promise<void>;
}

const useTokenStoreBase = create<TokenState>()(
  immer((set) => ({
    token: {
      nervosnetwork: {
        tokens: [],
        native: {
          name: "Nervos Network",
          symbol: "CKB",
          address: "ckb",
          supply: -1,
          tokenDecimal: 8,
          logoURI: "/nervos.png",
        },
      },
    },
    updateTokens: async (chain: SupportedChain, tokens: SupportedToken[]) => {
      set((state) => {
        state.token[chain].tokens = tokens;
      });
    },
  })),
);

export const useTokenStore = useTokenStoreBase;
