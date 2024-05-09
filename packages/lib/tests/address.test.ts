import {
  AddressType,
  ExtendedPrivateKey,
  mnemonic as mnemonicLib,
} from "@ckb-lumos/hd";
import test from "ava";
import BIP32Factory from "bip32";
import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";

import {
  publicKeyToNativeSegwitAddress,
  publicKeyToTaprootAddress,
} from "../src/btc/address";
import { getNativeSegwitAddress, getTapRootAddress } from "../src/btc/key";
import {
  NativeSegwitAccountExtendedPublicKey,
  toNativeSegwitAccountExtendedPublicKey,
} from "../src/btc/key/native_segwit";
import {
  TaprootAccountExtendedPublicKey,
  toTaprootAccountExtendedPublicKey,
} from "../src/btc/key/taproot";

bitcoin.initEccLib(ecc);

const bip32 = BIP32Factory(ecc);

test("get btc native segwit address from ckb extendedPrivateKey", (t) => {
  const mnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const btcSeed = bip39.mnemonicToSeedSync(mnemonic);
  let node = bip32.fromSeed(btcSeed);
  node = node.derivePath(
    NativeSegwitAccountExtendedPublicKey.pathFor(AddressType.Receiving, 0),
  );

  const { address } = bitcoin.payments.p2wpkh({
    pubkey: node.publicKey,
  });

  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(
    mnemonicLib.mnemonicToSeedSync(mnemonic),
  );

  const accountExtendedPublicKey =
    toNativeSegwitAccountExtendedPublicKey(extendedPrivateKey);

  const nativeSegwitAddress = publicKeyToNativeSegwitAddress(
    accountExtendedPublicKey,
    AddressType.Receiving,
    0,
  );

  t.is(address, nativeSegwitAddress);
});

test("serialize NativeSegwitAccountExtendedPublicKey", (t) => {
  const mnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(
    mnemonicLib.mnemonicToSeedSync(mnemonic),
  );

  const serialized =
    toNativeSegwitAccountExtendedPublicKey(extendedPrivateKey).serialize();

  t.is(
    serialized,
    "0x02707a62fdacc26ea9b63b1c197906f56ee0180d0bcf1966e1a2da34f5f3a09a9b4a53a0ab21b9dc95869c4e92a161194e03c0ef3ff5014ac692f433c4765490fc",
  );

  const { address } = getNativeSegwitAddress(
    serialized,
    AddressType.Receiving,
    0,
  );

  t.is(address, "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu");
});

test("get btc taproot address", async (t) => {
  const mnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let node = bip32.fromSeed(seed);
  node = node.derivePath(
    TaprootAccountExtendedPublicKey.pathFor(AddressType.Receiving, 0),
  );

  // Since internalKey is an xOnly pubkey, we drop the DER header byte
  const childNodeXOnlyPubkey = toXOnly(node.publicKey);
  const { address, output } = bitcoin.payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
  });

  t.is(
    address,
    "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
  );

  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(
    mnemonicLib.mnemonicToSeedSync(mnemonic),
  );

  const accountExtendedPublicKey =
    toTaprootAccountExtendedPublicKey(extendedPrivateKey);

  const taprootAddress = publicKeyToTaprootAddress(
    accountExtendedPublicKey,
    AddressType.Receiving,
    0,
  );

  t.is(address, taprootAddress);
});

test("serialize TapRootAccountExtendedPublicKey", (t) => {
  const mnemonic =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(
    mnemonicLib.mnemonicToSeedSync(mnemonic),
  );

  const serialized =
    toTaprootAccountExtendedPublicKey(extendedPrivateKey).serialize();

  t.is(
    serialized,
    "0x03418278a2885c8bb98148158d1474634097a179c642f23cf1cc04da629ac6f0fbc61a8f27e98182314d2444da3e600eb5836ec8ad183c86c311f95df8082b18aa",
  );

  const { address } = getTapRootAddress(serialized, AddressType.Receiving, 0);

  t.is(
    address,
    "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
  );
});

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33);
}
