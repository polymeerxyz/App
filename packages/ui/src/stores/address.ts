import { AddressType } from "@ckb-lumos/hd";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { AddressInfo } from "@/lib/models/address";
import { SupportedChain } from "@/lib/models/token";

interface AddressState {
  config: Record<SupportedChain, AddressInfo>;
  setAddressInfo: (chain: SupportedChain, addressInfo: AddressInfo) => void;
  getAddressInfo: (chain: SupportedChain) => AddressInfo;
}

const useAddressStoreBase = create<AddressState>()(
  persist(
    immer((set, get) => ({
      config: { nervosnetwork: { addressType: AddressType.Receiving, index: 0 } },
      setAddressInfo: (chain: SupportedChain, addressInfo: AddressInfo) => {
        set((state) => {
          state.config[chain] = addressInfo;
        });
      },
      getAddressInfo: (chain: SupportedChain) => {
        return get().config[chain];
      },
    })),
    {
      name: "address",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useAddressStore = useAddressStoreBase;
