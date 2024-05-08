import { AccountExtendedPublicKey } from "@ckb-lumos/hd";
import { publicKeyToAddress, publicKeyToLegacyAddress } from "@polymeerxyz/lib";
import { useMemo } from "react";

import { useAppContext } from "@/routes/hook";
import { useAddressStore } from "@/stores/address";
import { useWalletStore } from "@/stores/wallet";

export const useActiveAddress = () => {
  const {
    ckb: { config },
  } = useAppContext();
  const { addressType, index } = useAddressStore((s) => s.getAddressInfo("nervosnetwork"));
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));

  return useMemo(() => {
    const accountExtendedPublicKey = AccountExtendedPublicKey.parse(activeWallet!.serializedAccountExtendedPublicKey);
    return {
      id: activeWallet!.id,
      full: publicKeyToAddress(accountExtendedPublicKey, addressType, index, config),
      legacy: publicKeyToLegacyAddress(accountExtendedPublicKey, addressType, index, config),
      path: AccountExtendedPublicKey.pathFor(addressType, index),
    };
  }, [activeWallet, addressType, config, index]);
};
