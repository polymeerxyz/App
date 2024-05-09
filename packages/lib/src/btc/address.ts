import { AddressType } from "@ckb-lumos/hd";
import * as bitcoin from "bitcoinjs-lib";

import { NativeSegwitAccountExtendedPublicKey } from "./key/native_segwit";
import { TaprootAccountExtendedPublicKey } from "./key/taproot";

export const publicKeyToNativeSegwitAddress = (
  nativeSegwitAccountExtendedPublicKey: NativeSegwitAccountExtendedPublicKey,
  type: AddressType,
  index: number,
) => {
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(
      nativeSegwitAccountExtendedPublicKey
        .publicKeyInfo(type, index)
        .publicKey.slice(2),
      "hex",
    ),
  });

  return address;
};

export const publicKeyToTaprootAddress = (
  taprootAccountExtendedPublicKey: TaprootAccountExtendedPublicKey,
  type: AddressType,
  index: number,
) => {
  const { address } = bitcoin.payments.p2tr({
    internalPubkey: Buffer.from(
      taprootAccountExtendedPublicKey
        .publicKeyInfo(type, index)
        .publicKey.slice(2),
      "hex",
    ).subarray(1, 33),
  });

  return address;
};
