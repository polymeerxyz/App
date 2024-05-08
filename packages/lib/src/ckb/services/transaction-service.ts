import {
  blockchain,
  Cell,
  Script,
  TransactionWithStatus,
} from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";
import { TransactionCollector } from "@ckb-lumos/ckb-indexer";
import { bytes, number } from "@ckb-lumos/codec";
import { common } from "@ckb-lumos/common-scripts";
import { minimalCellCapacity, TransactionSkeleton } from "@ckb-lumos/helpers";

import { FeeRate } from "../types/fee";
import { areScriptsEqual } from "../types/script";
import { Transaction, TransactionType } from "../types/transaction";
import { XUDTWitness } from "../types/xudt";
import { addCellDep, parseOutputNumber } from "../utils";
import { BaseService } from "./service";

export default class TransactionService extends BaseService {
  transfer = async (options: {
    from: string;
    to: string;
    amount: BI;
    feeBearer: string;
    feeRate: FeeRate;
  }) => {
    let txSkeleton = new TransactionSkeleton({ cellProvider: this._indexer });
    txSkeleton = await common.transfer(
      txSkeleton,
      [options.from],
      options.to,
      options.amount,
      undefined,
      undefined,
      this.configObject,
    );

    txSkeleton = await common.payFeeByFeeRate(
      txSkeleton,
      [options.feeBearer],
      options.feeRate,
      undefined,
      this.configObject,
    );

    return txSkeleton;
  };

  transferXUDT = async (options: {
    xudtArgs: string;
    from: string;
    amount: BI;
    to: string;
    feeBearer: string;
    feeRate: FeeRate;
  }) => {
    const senderLockScript = this.toLockScript(options.from);
    const receiverLockScript = this.toLockScript(options.to);

    const xudtDeps = this._config.SCRIPTS.XUDT!;
    const lockDeps = this._config.SCRIPTS.SECP256K1_BLAKE160!;

    const typeScript = {
      codeHash: xudtDeps.CODE_HASH,
      hashType: xudtDeps.HASH_TYPE,
      args: options.xudtArgs,
    };

    let txSkeleton = new TransactionSkeleton({ cellProvider: this._indexer });
    txSkeleton = addCellDep(txSkeleton, {
      outPoint: {
        txHash: lockDeps.TX_HASH,
        index: lockDeps.INDEX,
      },
      depType: lockDeps.DEP_TYPE,
    });
    txSkeleton = addCellDep(txSkeleton, {
      outPoint: {
        txHash: xudtDeps.TX_HASH,
        index: xudtDeps.INDEX,
      },
      depType: xudtDeps.DEP_TYPE,
    });

    const targetOutput: Cell = {
      cellOutput: {
        capacity: "0x0",
        lock: receiverLockScript,
        type: typeScript,
      },
      data: bytes.hexify(number.Uint128LE.pack(options.amount)),
    };

    const capacity = minimalCellCapacity(targetOutput);
    targetOutput.cellOutput.capacity = "0x" + capacity.toString(16);

    const neededCapacity = BI.from(capacity);
    let collectedSum = BI.from(0);
    let collectedAmount = BI.from(0);
    const collected: Cell[] = [];
    const collector = this._indexer.collector({
      lock: senderLockScript,
      type: typeScript,
    });
    for await (const cell of collector.collect()) {
      collectedSum = collectedSum.add(cell.cellOutput.capacity);
      collectedAmount = collectedAmount.add(parseOutputNumber(cell.data));
      collected.push(cell);
      if (collectedAmount >= BI.from(options.amount)) break;
    }

    let changeOutputTokenAmount = BI.from(0);
    if (collectedAmount.gt(BI.from(options.amount))) {
      changeOutputTokenAmount = collectedAmount.sub(BI.from(options.amount));
    }

    const changeOutput: Cell = {
      cellOutput: {
        capacity: "0x0",
        lock: senderLockScript,
        type: typeScript,
      },
      data: bytes.hexify(
        number.Uint128LE.pack(changeOutputTokenAmount.toString(10)),
      ),
    };

    const changeOutputNeededCapacity = BI.from(
      minimalCellCapacity(changeOutput),
    );

    const extraNeededCapacity = collectedSum.lt(neededCapacity)
      ? neededCapacity.sub(collectedSum).add(changeOutputNeededCapacity)
      : collectedSum.sub(neededCapacity).add(changeOutputNeededCapacity);

    if (extraNeededCapacity.gt(0)) {
      let extraCollectedSum = BI.from(0);
      const extraCollectedCells: Cell[] = [];
      const collector = this._indexer.collector({
        lock: senderLockScript,
        type: "empty",
      });
      for await (const cell of collector.collect()) {
        extraCollectedSum = extraCollectedSum.add(cell.cellOutput.capacity);
        extraCollectedCells.push(cell);
        if (extraCollectedSum >= extraNeededCapacity) break;
      }

      if (extraCollectedSum.lt(extraNeededCapacity)) {
        throw new Error(
          `Not enough CKB for change, ${extraCollectedSum} < ${extraNeededCapacity}`,
        );
      }

      txSkeleton = txSkeleton.update("inputs", (inputs) =>
        inputs.push(...extraCollectedCells),
      );

      const change2Capacity = extraCollectedSum.sub(extraNeededCapacity);
      if (change2Capacity.gt(61000000000)) {
        changeOutput.cellOutput.capacity =
          changeOutputNeededCapacity.toHexString();
        const changeOutput2: Cell = {
          cellOutput: {
            capacity: change2Capacity.toHexString(),
            lock: senderLockScript,
          },
          data: "0x",
        };
        txSkeleton = txSkeleton.update("outputs", (outputs) =>
          outputs.push(changeOutput2),
        );
      } else {
        changeOutput.cellOutput.capacity = extraCollectedSum.toHexString();
      }
    }

    txSkeleton = txSkeleton.update("inputs", (inputs) =>
      inputs.push(...collected),
    );
    txSkeleton = txSkeleton.update("outputs", (outputs) =>
      outputs.push(targetOutput, changeOutput),
    );

    /* 65-byte zeros in hex */
    const lockWitness =
      "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    const inputTypeWitness = XUDTWitness.pack({ extension_data: [] });
    const outputTypeWitness = XUDTWitness.pack({ extension_data: [] });
    const witnessArgs = blockchain.WitnessArgs.pack({
      lock: lockWitness,
      inputType: inputTypeWitness,
      outputType: outputTypeWitness,
    });
    const witness = bytes.hexify(witnessArgs);
    txSkeleton = txSkeleton.update("witnesses", (witnesses) =>
      witnesses.set(0, witness),
    );

    txSkeleton = await common.payFeeByFeeRate(
      txSkeleton,
      [options.feeBearer],
      options.feeRate,
      undefined,
      this.configObject,
    );

    return txSkeleton;
  };

  listNativeTransaction = async (address: string) => {
    const lockScript = this.toLockScript(address);

    const txCollector = new TransactionCollector(
      this._indexer,
      {
        lock: lockScript,
        type: "empty",
      },
      this._indexer.uri,
    );

    const transactions: Transaction[] = [];
    for await (const tx of txCollector.collect()) {
      const {
        transaction: { inputs, outputs, outputsData, hash },
      } = tx as TransactionWithStatus;

      const isExisted = transactions.some((t) => t.hash === hash);
      if (isExisted) continue;

      let txType = TransactionType.RECEIVE_NATIVE_TOKEN;
      let amount = BI.from(0);

      for (const {
        previousOutput: { txHash, index },
      } of inputs) {
        const previousTx = await this._rpc.getTransaction(txHash);

        const { lock, capacity, type } = (previousTx as TransactionWithStatus)
          .transaction.outputs[BI.from(index).toNumber()];

        if (areScriptsEqual(lock, lockScript)) {
          txType = TransactionType.SEND_NATIVE_TOKEN;
          amount = amount.add(BI.from(capacity));
        }
      }

      let isNegative = txType === TransactionType.SEND_NATIVE_TOKEN;
      let currentTx: Partial<Transaction> = {};
      for (let index = 0; index < outputs.length; index++) {
        const { lock, capacity, type } = outputs[index];

        if (areScriptsEqual(lock, lockScript)) {
          if (type) {
            const daoScript: Script = {
              codeHash: this._config.SCRIPTS.DAO!.CODE_HASH,
              hashType: this._config.SCRIPTS.DAO!.HASH_TYPE,
              args: "0x",
            };
            if (areScriptsEqual(type, daoScript)) {
              isNegative = false;
              txType = TransactionType.DEPOSIT_DAO;
            }
          }

          currentTx = {
            hash,
            amount: isNegative
              ? amount.sub(BI.from(capacity))
              : BI.from(capacity),
            type: txType,
          };
        }
      }

      if (isNegative && !currentTx.hash) {
        currentTx = {
          hash,
          amount,
          type: txType,
        };
      }

      const header = await this._rpc.getHeader(
        (tx as TransactionWithStatus).txStatus.blockHash!,
      );
      currentTx.timestamp = Number(header.timestamp);
      transactions.push(currentTx as Transaction);
    }

    return transactions;
  };

  listXUDTTransaction = async (address: string, xudtArgs: string) => {
    const lockScript = this.toLockScript(address);

    const typeScript: Script = {
      codeHash: this._config.SCRIPTS.XUDT!.CODE_HASH,
      hashType: this._config.SCRIPTS.XUDT!.HASH_TYPE,
      args: xudtArgs,
    };

    const txCollector = new TransactionCollector(
      this._indexer,
      {
        lock: lockScript,
        type: typeScript,
      },
      this._indexer.uri,
    );

    const transactions: Transaction[] = [];
    for await (const tx of txCollector!.collect()) {
      const {
        transaction: { inputs, outputs, outputsData, hash },
      } = tx as TransactionWithStatus;

      const isExisted = transactions.some((t) => t.hash === hash);
      if (isExisted) continue;

      let txType = TransactionType.RECEIVE_NATIVE_TOKEN;
      let amount = BI.from(0);

      for (const {
        previousOutput: { txHash, index },
      } of inputs) {
        const previousTx = await this._rpc.getTransaction(txHash);

        const { lock, capacity, type } = (previousTx as TransactionWithStatus)
          .transaction.outputs[BI.from(index).toNumber()];

        const data = (previousTx as TransactionWithStatus).transaction
          .outputsData[BI.from(index).toNumber()];

        if (areScriptsEqual(lock, lockScript)) {
          txType = TransactionType.SEND_TOKEN;
          amount = amount.add(parseOutputNumber(data));
        }
      }

      let currentTx: Partial<Transaction> = {};
      for (let index = 0; index < outputs.length; index++) {
        const { lock, capacity } = outputs[index];

        if (areScriptsEqual(lock, lockScript)) {
          const data = outputsData[index];
          currentTx = {
            hash,
            amount:
              txType === TransactionType.SEND_TOKEN
                ? amount.sub(parseOutputNumber(data))
                : amount.add(parseOutputNumber(data)),
            type: txType,
          };
        }
      }

      if (txType === TransactionType.SEND_TOKEN && !currentTx.hash) {
        currentTx = {
          hash,
          amount,
          type: txType,
        };
      }

      const header = await this._rpc.getHeader(
        (tx as TransactionWithStatus).txStatus.blockHash!,
      );
      currentTx.timestamp = Number(header.timestamp);
      transactions.push(currentTx as Transaction);
    }

    return transactions;
  };
}
