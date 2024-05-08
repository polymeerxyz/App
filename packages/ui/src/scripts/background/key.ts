import { AddressType } from "@ckb-lumos/hd";
import { createPrivateKey, derivePrivateKey, getPrivateKey } from "@polymeerxyz/lib";
import { createStore, get, set } from "idb-keyval";
import { v4 as uuid } from "uuid";

import { PrivateKeyCache } from "@/scripts/background/cache/key";
import { createRuntimeService } from "@/scripts/base";

export const creatKeyService = (privateKeyCache: PrivateKeyCache) => {
  const ckbKeystoreStore = createStore("polymeer", "ckb/keystore");

  return createRuntimeService({
    name: "key",
    listeners: {
      saveKeystore: async (params: { mnemonic: string; password: string }) => {
        const id = uuid();
        const { mnemonic, password } = params;

        const { extendedPrivateKey, json, serializedAccountExtendedPublicKey } = createPrivateKey(mnemonic, password);

        privateKeyCache.saveKey(id, extendedPrivateKey);
        await set(id, json, ckbKeystoreStore);

        return { id, serializedAccountExtendedPublicKey };
      },
      loadKeystore: async (params: { id: string; password: string }) => {
        const { id, password } = params;

        const json = await get(id, ckbKeystoreStore);
        if (!json) throw new Error("Keystore not found");

        const { extendedPrivateKey } = getPrivateKey(json, password);

        privateKeyCache.saveKey(id, extendedPrivateKey);
      },
      hasKeystore: async (params: { id: string }) => {
        privateKeyCache.evictExpiredKey();
        return privateKeyCache.hasKey(params.id);
      },
      getPrivateKey: async (params: { id: string; addressType: AddressType; index: number }) => {
        const { id, addressType, index } = params;

        const extendedPrivateKey = privateKeyCache.getKey(id);
        if (!extendedPrivateKey) throw new Error("PrivateKey not found");

        return derivePrivateKey(extendedPrivateKey, addressType, index);
      },
    },
  });
};
