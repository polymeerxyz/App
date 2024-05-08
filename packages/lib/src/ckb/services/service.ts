import { blockchain, Transaction } from "@ckb-lumos/base";
import type { Indexer } from "@ckb-lumos/ckb-indexer";
import { bytes } from "@ckb-lumos/codec";
import { common } from "@ckb-lumos/common-scripts";
import type { Config } from "@ckb-lumos/config-manager";
import { key } from "@ckb-lumos/hd";
import {
  createTransactionFromSkeleton,
  parseAddress,
  sealTransaction,
  TransactionSkeletonType,
} from "@ckb-lumos/helpers";
import type { RPC } from "@ckb-lumos/rpc";

import LedgerDevice from "../hardware/ledger";

export class BaseService {
  protected _config: Config;
  protected _indexer: Indexer;
  protected _rpc: RPC;

  constructor(config: Config, indexer: Indexer, rpc: RPC) {
    this._config = config;
    this._indexer = indexer;
    this._rpc = rpc;
  }

  protected get mainnet() {
    return this._config.PREFIX === "ckb";
  }

  protected get configObject() {
    return { config: this._config };
  }

  toLockScript = (address: string) => parseAddress(address, this.configObject);

  signWithPrivateKeys = async (
    txSkeleton: TransactionSkeletonType,
    privateKeys: string[],
  ) => {
    const txSkeletonWithSigningEntries = common.prepareSigningEntries(
      txSkeleton,
      this.configObject,
    );

    const signatures = [];
    for (let i = 0; i < privateKeys.length; i += 1) {
      const entry = txSkeletonWithSigningEntries.get("signingEntries").get(i);
      signatures.push(key.signRecoverable(entry!.message, privateKeys[i]));
    }

    return sealTransaction(txSkeletonWithSigningEntries, signatures);
  };

  signWithLedger = async (
    txSkeleton: TransactionSkeletonType,
    device: LedgerDevice,
    path: string,
  ) => {
    const signature = await device.signTransaction(txSkeleton, path);
    const txSkeletonWithSignature = this.updateSignature(txSkeleton, signature);
    return createTransactionFromSkeleton(txSkeletonWithSignature);
  };

  send = async (tx: Transaction) => {
    return await this._rpc.sendTransaction(tx, "passthrough");
  };

  private updateSignature = (
    txSkeleton: TransactionSkeletonType,
    signature: string,
  ) => {
    return txSkeleton.update("witnesses", (witnesses) =>
      witnesses.map((witness) => {
        if (witness === "0x") return witness;
        const newWitness = blockchain.WitnessArgs.unpack(bytes.bytify(witness));
        newWitness.lock = "0x" + signature;
        return bytes.hexify(blockchain.WitnessArgs.pack(newWitness));
      }),
    );
  };
}
