import { HexString } from "@ckb-lumos/base";
import {
  AddressType,
  ExtendedPrivateKey,
  ExtendedPublicKey,
  Keychain,
} from "@ckb-lumos/hd";

import { PublicKeyInfo } from "../types/key";

export const NATIVE_SEGWIT_PATH = "m/84'/0'/0'";

export class NativeSegwitAccountExtendedPublicKey extends ExtendedPublicKey {
  static parse(serialized: HexString): NativeSegwitAccountExtendedPublicKey {
    return new NativeSegwitAccountExtendedPublicKey(
      serialized.slice(0, 68),
      "0x" + serialized.slice(68),
    );
  }

  publicKeyInfo(type: AddressType, index: number): PublicKeyInfo {
    const publicKey = this.getPublicKey(type, index);
    return {
      path: NativeSegwitAccountExtendedPublicKey.pathFor(type, index),
      publicKey,
    };
  }

  static pathForReceiving(index: number) {
    return NativeSegwitAccountExtendedPublicKey.pathFor(
      AddressType.Receiving,
      index,
    );
  }

  static pathForChange(index: number) {
    return NativeSegwitAccountExtendedPublicKey.pathFor(
      AddressType.Change,
      index,
    );
  }

  static pathFor = (type: AddressType, index: number) => {
    return `${NATIVE_SEGWIT_PATH}/${type}/${index}`;
  };

  private getPublicKey(type: AddressType, index: number): HexString {
    const keychain = Keychain.fromPublicKey(
      Buffer.from(this.publicKey.slice(2), "hex"),
      Buffer.from(this.chainCode.slice(2), "hex"),
      NATIVE_SEGWIT_PATH,
    )
      .deriveChild(type, false)
      .deriveChild(index, false);

    return "0x" + keychain.publicKey.toString("hex");
  }
}

export function toNativeSegwitAccountExtendedPublicKey(
  extendedPrivateKey: ExtendedPrivateKey,
): NativeSegwitAccountExtendedPublicKey {
  const masterKeychain = new Keychain(
    Buffer.from(extendedPrivateKey.privateKey.slice(2), "hex"),
    Buffer.from(extendedPrivateKey.chainCode.slice(2), "hex"),
  );
  const accountKeychain = masterKeychain.derivePath(NATIVE_SEGWIT_PATH);

  return new NativeSegwitAccountExtendedPublicKey(
    "0x" + accountKeychain.publicKey.toString("hex"),
    "0x" + accountKeychain.chainCode.toString("hex"),
  );
}
