import { Cell, Script } from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";

import { parseOutputNumber } from "../utils";
import { BaseService } from "./service";

export default class CellService extends BaseService {
  getNativeCapacity = async (address: string) => {
    const lockScript = this.toLockScript(address);

    const collector = this._indexer.collector({
      lock: lockScript,
    });

    let availableAmount = BI.from(0);
    let collectedSum = BI.from(0);
    const collectedAmount = BI.from(0);
    const collected: Cell[] = [];

    for await (const cell of collector.collect()) {
      // only capacity for native
      if (!cell.cellOutput.type)
        availableAmount = availableAmount.add(cell.cellOutput.capacity);

      // sum of all native capacity
      collectedSum = collectedSum.add(cell.cellOutput.capacity);
      collected.push(cell);
    }

    return { availableAmount, collectedSum, collected, collectedAmount };
  };

  getXUDTCapacity = async (address: string, xudtArgs: string) => {
    const lockScript = this.toLockScript(address);

    const typeScript: Script = {
      codeHash: this._config.SCRIPTS.XUDT!.CODE_HASH,
      hashType: this._config.SCRIPTS.XUDT!.HASH_TYPE,
      args: xudtArgs,
    };

    const collector = this._indexer.collector({
      lock: lockScript,
      type: typeScript,
    });

    const availableAmount = BI.from(0);
    const collectedSum = BI.from(0);
    let collectedAmount = BI.from(0);
    const collected: Cell[] = [];

    for await (const cell of collector.collect()) {
      // sum of all xUDT amount (data)
      collectedAmount = collectedAmount.add(parseOutputNumber(cell.data));
      collected.push(cell);
    }

    return { availableAmount, collectedSum, collected, collectedAmount };
  };
}
