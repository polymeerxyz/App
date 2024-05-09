import { HexString } from "@ckb-lumos/base";
import {
  AddressType,
  ExtendedPrivateKey,
  ExtendedPublicKey,
  Keychain,
} from "@ckb-lumos/hd";

import { PublicKeyInfo } from "../types/key";

export const TAPROOT_PATH = "m/86'/0'/0'";

export class TaprootAccountExtendedPublicKey extends ExtendedPublicKey {
  static parse(serialized: HexString): TaprootAccountExtendedPublicKey {
    return new TaprootAccountExtendedPublicKey(
      serialized.slice(0, 68),
      "0x" + serialized.slice(68),
    );
  }

  publicKeyInfo(type: AddressType, index: number): PublicKeyInfo {
    const publicKey = this.getPublicKey(type, index);
    return {
      path: TaprootAccountExtendedPublicKey.pathFor(type, index),
      publicKey,
    };
  }

  static pathForReceiving(index: number) {
    return TaprootAccountExtendedPublicKey.pathFor(
      AddressType.Receiving,
      index,
    );
  }

  static pathForChange(index: number) {
    return TaprootAccountExtendedPublicKey.pathFor(AddressType.Change, index);
  }

  static pathFor = (type: AddressType, index: number) => {
    return `${TAPROOT_PATH}/${type}/${index}`;
  };

  private getPublicKey(type: AddressType, index: number): HexString {
    const keychain = Keychain.fromPublicKey(
      Buffer.from(this.publicKey.slice(2), "hex"),
      Buffer.from(this.chainCode.slice(2), "hex"),
      TAPROOT_PATH,
    )
      .deriveChild(type, false)
      .deriveChild(index, false);

    return "0x" + keychain.publicKey.toString("hex");
  }
}

export function toTaprootAccountExtendedPublicKey(
  extendedPrivateKey: ExtendedPrivateKey,
): TaprootAccountExtendedPublicKey {
  const masterKeychain = new Keychain(
    Buffer.from(extendedPrivateKey.privateKey.slice(2), "hex"),
    Buffer.from(extendedPrivateKey.chainCode.slice(2), "hex"),
  );
  const accountKeychain = masterKeychain.derivePath(TAPROOT_PATH);

  return new TaprootAccountExtendedPublicKey(
    "0x" + accountKeychain.publicKey.toString("hex"),
    "0x" + accountKeychain.chainCode.toString("hex"),
  );
}
