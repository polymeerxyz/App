import { Cell } from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";
import { dao } from "@ckb-lumos/common-scripts";
import { payFeeByFeeRate } from "@ckb-lumos/common-scripts/lib/common";
import { TransactionSkeleton } from "@ckb-lumos/helpers";

import { Dao, DaoType } from "../types/dao";
import { FeeRate } from "../types/fee";
import { BaseService } from "./service";

export default class DaoService extends BaseService {
  deposit = async (options: { from: string; amount: BI; feeRate: FeeRate }) => {
    let txSkeleton = new TransactionSkeleton({ cellProvider: this._indexer });
    txSkeleton = await dao.deposit(
      txSkeleton,
      options.from,
      options.from,
      options.amount,
      this.configObject,
    );
    txSkeleton = await payFeeByFeeRate(
      txSkeleton,
      [options.from],
      options.feeRate,
      undefined,
      this.configObject,
    );
    return txSkeleton;
  };

  withdraw = async (options: {
    depositCell: Cell;
    from: string;
    feeRate: FeeRate;
  }) => {
    let txSkeleton = new TransactionSkeleton({ cellProvider: this._indexer });
    txSkeleton = await dao.withdraw(
      txSkeleton,
      options.depositCell,
      options.from,
      this.configObject,
    );
    txSkeleton = await payFeeByFeeRate(
      txSkeleton,
      [options.from],
      options.feeRate,
      undefined,
      this.configObject,
    );
    return txSkeleton;
  };

  unlock = async (options: {
    depositCell: Cell;
    withdrawCell: Cell;
    from: string;
    feeRate: FeeRate;
  }) => {
    let txSkeleton = new TransactionSkeleton({ cellProvider: this._indexer });
    txSkeleton = await dao.unlock(
      txSkeleton,
      options.depositCell,
      options.withdrawCell,
      options.from,
      options.from,
      this.configObject,
    );
    txSkeleton = await payFeeByFeeRate(
      txSkeleton,
      [options.from],
      options.feeRate,
      undefined,
      this.configObject,
    );
    return txSkeleton;
  };

  list = async (address: string) => {
    const depositCollector = new dao.CellCollector(
      address,
      this._indexer,
      "deposit",
      this.configObject,
    );

    const daos: Dao[] = [];

    for await (const cell of depositCollector.collect()) {
      const transaction = await this._rpc.getTransaction(cell.outPoint!.txHash);
      const header = await this._rpc.getHeader(transaction.txStatus.blockHash!);

      daos.push({
        hash: cell.outPoint!.txHash,
        amount: BI.from(cell.cellOutput.capacity),
        timestamp: Number(header.timestamp),
        type: DaoType.DEPOSIT,
      });
    }

    const withdrawCollector = new dao.CellCollector(
      address,
      this._indexer,
      "withdraw",
      this.configObject,
    );

    for await (const cell of withdrawCollector.collect()) {
      const transaction = await this._rpc.getTransaction(cell.outPoint!.txHash);
      const header = await this._rpc.getHeader(transaction.txStatus.blockHash!);

      daos.push({
        hash: cell.outPoint!.txHash,
        amount: BI.from(cell.cellOutput.capacity),
        timestamp: Number(header.timestamp),
        type: DaoType.WITHDRAW,
      });
    }

    return daos;
  };

  prepareDaoCells = async (
    outPoint: { txHash: string; index: string },
    type: DaoType,
  ): Promise<Cell[]> => {
    const currentTx = await this._rpc.getTransaction(outPoint.txHash);
    if (!currentTx) {
      throw new Error(`not found tx: ${outPoint.txHash}`);
    }

    const currentBlock = await this._rpc.getBlock(
      currentTx.txStatus.blockHash!,
    );
    const currentCell = {
      cellOutput: currentTx.transaction.outputs[0],
      data: currentTx.transaction.outputsData[0],
      outPoint: outPoint,
      blockHash: currentTx.txStatus.blockHash,
      blockNumber: currentBlock!.header.number,
    };

    if (type === DaoType.DEPOSIT) return [currentCell];

    const lastTx = await this._rpc.getTransaction(
      currentTx.transaction.inputs[0].previousOutput!.txHash,
    );
    if (!lastTx) {
      throw new Error(`not found tx: ${outPoint.txHash}`);
    }

    const oldBlock = await this._rpc.getBlock(currentTx.txStatus.blockHash!);
    const oldCell = {
      cellOutput: lastTx.transaction.outputs[0],
      data: lastTx.transaction.outputsData[0],
      outPoint: outPoint,
      blockHash: lastTx.txStatus.blockHash,
      blockNumber: oldBlock!.header.number,
    };

    return [oldCell, currentCell];
  };
}
