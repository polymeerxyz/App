import { Script } from "@ckb-lumos/base";
import { computeScriptHash } from "@ckb-lumos/base/lib/utils";
import { number } from "@ckb-lumos/codec";
import { bytify } from "@ckb-lumos/codec/lib/bytes";

import { XUDT } from "../types/xudt";
import { BaseService } from "./service";

export default class XUDTService extends BaseService {
  getXUDTInfo = async (xudtArgs: string) => {
    const xudtScript: Script = {
      codeHash: this._config.SCRIPTS.XUDT!.CODE_HASH,
      hashType: this._config.SCRIPTS.XUDT!.HASH_TYPE,
      args: xudtArgs,
    };

    const {
      objects: [txInfo],
    } = await this._indexer.getTransactions(
      {
        script: xudtScript,
        scriptType: "type",
      },
      {
        sizeLimit: 1,
      },
    );

    const {
      transaction: { outputsData },
    } = await this._rpc.getTransaction(txInfo.txHash);

    const tokenInfoIndex = outputsData.findIndex((data) => {
      if (data === "0x") return false;
      try {
        number.Uint128LE.unpack(data);
        return false;
      } catch (error) {
        return true;
      }
    });

    const typeHash = computeScriptHash(xudtScript);
    return {
      id: typeHash,
      xudtArgs,
      xudtCodeHash: this._config.SCRIPTS.XUDT!.CODE_HASH,
      xudtTypeHash: typeHash,
      ...this.decodeXUDTInfo(outputsData[tokenInfoIndex]),
    } as XUDT;
  };

  private decodeXUDTInfo = (info: string) => {
    const decimal = number.Uint8.unpack("0x" + info.slice(2, 4));
    const nameSize = number.Uint8.unpack("0x" + info.slice(4, 6));
    const name = bytify("0x" + info.slice(6, 6 + nameSize * 2)).reduce(
      (acc, x) => {
        acc = acc + String.fromCharCode(x);
        return acc;
      },
      "",
    );
    const symbolSize = number.Uint8.unpack(
      "0x" + info.slice(6 + nameSize * 2, 8 + nameSize * 2),
    );
    const symbol = bytify(
      "0x" + info.slice(8 + nameSize * 2, 8 + nameSize * 2 + symbolSize * 2),
    ).reduce((acc, x) => {
      acc = acc + String.fromCharCode(x);
      return acc;
    }, "");

    return {
      decimal,
      name,
      symbol,
    };
  };
}
