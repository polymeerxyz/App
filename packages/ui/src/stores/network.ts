import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { NetworkInfo } from "@/lib/models/network";
import { SupportedChain } from "@/lib/models/token";

interface NetworkState {
  config: Record<SupportedChain, NetworkInfo>;
  setNetworkInfo: (chain: SupportedChain, networkInfo: NetworkInfo) => void;
  getNetworkInfo: (chain: SupportedChain) => NetworkInfo;
}

const useNetworkStoreBase = create<NetworkState>()(
  persist(
    immer((set, get) => ({
      config: { nervosnetwork: { rpcUrl: "https://mainnet.ckb.dev", type: "mainnet" } },
      setNetworkInfo: (chain: SupportedChain, networkInfo: NetworkInfo) => {
        set((state) => {
          state.config[chain] = networkInfo;
        });
      },
      getNetworkInfo: (chain: SupportedChain) => {
        return get().config[chain];
      },
    })),
    {
      name: "network",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useNetworkStore = useNetworkStoreBase;
