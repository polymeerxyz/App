import { AddressType } from "@ckb-lumos/hd";

import {
  publicKeyToNativeSegwitAddress,
  publicKeyToTaprootAddress,
} from "../address";
import { NativeSegwitAccountExtendedPublicKey } from "./native_segwit";
import { TaprootAccountExtendedPublicKey } from "./taproot";

export function getNativeSegwitAddress(
  serializedAccountExtendedPublicKey: string,
  type: AddressType,
  index: number,
) {
  const nativeSegwitAccountExtendedPublicKey =
    NativeSegwitAccountExtendedPublicKey.parse(
      serializedAccountExtendedPublicKey,
    );

  return {
    address: publicKeyToNativeSegwitAddress(
      nativeSegwitAccountExtendedPublicKey,
      type,
      index,
    ),
    path: NativeSegwitAccountExtendedPublicKey.pathFor(type, index),
  };
}

export function getTapRootAddress(
  serializedAccountExtendedPublicKey: string,
  type: AddressType,
  index: number,
) {
  const tapRootAccountExtendedPublicKey = TaprootAccountExtendedPublicKey.parse(
    serializedAccountExtendedPublicKey,
  );

  return {
    address: publicKeyToTaprootAddress(
      tapRootAccountExtendedPublicKey,
      type,
      index,
    ),
    path: TaprootAccountExtendedPublicKey.pathFor(type, index),
  };
}
