import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { BaseToken, SupportedChain, SupportedToken } from "@/lib/models/token";

interface TokenState {
  token: Record<SupportedChain, { customs: SupportedToken[]; native: BaseToken; tokens: SupportedToken[] }>;
  getTokens: (chain: SupportedChain, withNative: boolean) => SupportedToken[];
  updateTokens: (chain: SupportedChain, tokens: SupportedToken[]) => void;
  addToken: (chain: SupportedChain, ...tokens: SupportedToken[]) => void;
  removeToken: (chain: SupportedChain, ...tokens: SupportedToken[]) => void;
}

const useTokenStoreBase = create<TokenState>()(
  persist(
    immer((set, get) => ({
      token: {
        nervosnetwork: {
          customs: [],
          native: {
            id: "ckb",
            name: "Nervos Network",
            symbol: "CKB",
            tokenDecimal: 8,
            logoURI: "/nervos.png",
          },
          tokens: [],
        },
      },
      getTokens: (chain: SupportedChain, withNative: boolean) => {
        if (chain === "nervosnetwork") {
          const { customs, native, tokens } = get().token[chain];
          if (withNative) return [native, ...customs, ...tokens];
          return [...customs, ...tokens];
        }
        return [];
      },
      updateTokens: (chain: SupportedChain, tokens: SupportedToken[]) => {
        set((state) => {
          state.token[chain].tokens = tokens;
        });
      },
      addToken: (chain: SupportedChain, ...tokens: SupportedToken[]) => {
        set((state) => {
          const existedToken =
            state.token[chain].customs.find((token) => tokens.findIndex((el) => el.id === token.id) !== -1) ??
            state.token[chain].tokens.find((token) => tokens.findIndex((el) => el.id === token.id) !== -1);
          if (!existedToken) state.token[chain].customs = [...state.token[chain].customs, ...tokens];
        });
      },
      removeToken: (chain: SupportedChain, ...tokens: SupportedToken[]) => {
        set((state) => {
          state.token[chain].customs = state.token[chain].customs.filter(
            (token) => tokens.findIndex((el) => el.id === token.id) !== -1,
          );
        });
      },
    })),
    {
      name: "token",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useTokenStore = useTokenStoreBase;
