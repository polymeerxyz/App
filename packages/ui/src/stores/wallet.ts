import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { SupportedChain } from "@/lib/models/token";
import { WalletInfo } from "@/lib/models/wallet";

interface WalletState {
  wallet: Record<
    SupportedChain,
    {
      activeWalletId: string;
      wallets: WalletInfo[];
    }
  >;
  setActiveWalletId: (chain: SupportedChain, value: string) => void;
  getActiveWallet: (chain: SupportedChain) => WalletInfo | undefined;
  addWallet: (chain: SupportedChain, value: WalletInfo) => void;
  removeWallet: (chain: SupportedChain, value: string) => void;
}

const useWalletStoreBase = create<WalletState>()(
  persist(
    immer((set, get) => ({
      wallet: { nervosnetwork: { wallets: [], activeWalletId: "" } },
      setActiveWalletId: (chain: SupportedChain, value: string) => {
        set((state) => {
          const hasWallet = state.wallet[chain].wallets.findIndex((el) => el.id === value) !== -1;
          if (hasWallet) state.wallet[chain].activeWalletId = value;
        });
      },
      getActiveWallet: (chain: SupportedChain) => {
        const { wallets, activeWalletId } = get().wallet[chain];
        return wallets.find((el) => el.id === activeWalletId);
      },
      addWallet: (chain: SupportedChain, value: WalletInfo) => {
        set((state) => {
          state.wallet[chain].activeWalletId = value.id;
          state.wallet[chain].wallets = [...state.wallet[chain].wallets, value];
        });
      },
      removeWallet: (chain: SupportedChain, value: string) => {
        set((state) => {
          const { wallets } = state.wallet[chain];
          state.wallet[chain].activeWalletId = wallets.length > 0 ? wallets[0].id : "";
          state.wallet[chain].wallets = wallets.filter((wallet) => wallet.id !== value);
        });
      },
    })),
    {
      name: "wallet",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useWalletStore = useWalletStoreBase;
