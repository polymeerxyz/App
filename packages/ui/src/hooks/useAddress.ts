import { AccountExtendedPublicKey } from "@ckb-lumos/hd";
import { ckb } from "@polymeerxyz/lib";
import { useMemo } from "react";

import { WalletInfo } from "@/lib/models/wallet";
import { useAppContext } from "@/routes/hook";
import { useAddressStore } from "@/stores/address";

export const useAddress = (wallet: WalletInfo) => {
  const {
    ckb: { config },
  } = useAppContext();
  const { addressType, index } = useAddressStore((s) => s.getAddressInfo("nervosnetwork"));

  return useMemo(() => {
    const accountExtendedPublicKey = AccountExtendedPublicKey.parse(wallet.serializedAccountExtendedPublicKey);
    return {
      id: wallet.id,
      full: ckb.publicKeyToAddress(accountExtendedPublicKey, addressType, index, config),
      legacy: ckb.publicKeyToLegacyAddress(accountExtendedPublicKey, addressType, index, config),
      path: AccountExtendedPublicKey.pathFor(addressType, index),
    };
  }, [addressType, config, index, wallet.id, wallet.serializedAccountExtendedPublicKey]);
};
