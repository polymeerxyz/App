import { Config } from "@ckb-lumos/config-manager";
import {
  AccountExtendedPublicKey,
  AddressType,
  ExtendedPrivateKey,
  Keychain,
  Keystore,
  mnemonic as mnemonicLib,
} from "@ckb-lumos/hd";

import { publicKeyToAddress, publicKeyToLegacyAddress } from "../address";

export function createPrivateKey(mnemonic: string, password: string) {
  const seed = mnemonicLib.mnemonicToSeedSync(mnemonic);
  const masterKeychain = Keychain.fromSeed(seed);
  const extendedPrivateKey = new ExtendedPrivateKey(
    "0x" + masterKeychain.privateKey.toString("hex"),
    "0x" + masterKeychain.chainCode.toString("hex"),
  );
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
  addressType: AddressType,
  index: number,
  config: Config,
) {
  const accountExtendedPublicKey = AccountExtendedPublicKey.parse(
    serializedAccountExtendedPublicKey,
  );

  return {
    full: publicKeyToAddress(
      accountExtendedPublicKey,
      addressType,
      index,
      config,
    ),
    legacy: publicKeyToLegacyAddress(
      accountExtendedPublicKey,
      addressType,
      index,
      config,
    ),
    path: AccountExtendedPublicKey.pathFor(addressType, index),
  };
}
