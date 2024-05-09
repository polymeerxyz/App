import { Config } from "@ckb-lumos/config-manager";
import {
  AccountExtendedPublicKey,
  AddressType,
  ExtendedPrivateKey,
  Keystore,
  mnemonic as mnemonicLib,
} from "@ckb-lumos/hd";

import { publicKeyToAddress, publicKeyToLegacyAddress } from "../address";

export function createPrivateKey(mnemonic: string, password: string) {
  const seed = mnemonicLib.mnemonicToSeedSync(mnemonic);
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);

  const serializedAccountExtendedPublicKey = extendedPrivateKey
    .toAccountExtendedPublicKey()
    .serialize();

  const keystore = Keystore.create(extendedPrivateKey, password);

  return {
    extendedPrivateKey,
    json: keystore.toJson(),
    serializedAccountExtendedPublicKey,
  };
}

export function getPrivateKey(json: string, password: string) {
  const keystore = Keystore.fromJson(json);
  const extendedPrivateKey = keystore.extendedPrivateKey(password);
  return { extendedPrivateKey };
}

export function derivePrivateKey(
  key: ExtendedPrivateKey,
  type: AddressType,
  index: number,
) {
  return key.privateKeyInfo(type, index).privateKey;
}

export function getAddress(
  serializedAccountExtendedPublicKey: string,
  type: AddressType,
  index: number,
  config: Config,
) {
  const accountExtendedPublicKey = AccountExtendedPublicKey.parse(
    serializedAccountExtendedPublicKey,
  );

  return {
    full: publicKeyToAddress(accountExtendedPublicKey, type, index, config),
    legacy: publicKeyToLegacyAddress(
      accountExtendedPublicKey,
      type,
      index,
      config,
    ),
    path: AccountExtendedPublicKey.pathFor(type, index),
  };
}
