import { CellDep, HexString, values } from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";
import { number } from "@ckb-lumos/codec";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";

export function addCellDep(
  txSkeleton: TransactionSkeletonType,
  { depType, outPoint }: CellDep,
) {
  return txSkeleton.update("cellDeps", (cellDeps) => {
    const existed =
      cellDeps.findIndex(
        (cellDep) =>
          cellDep.depType === depType &&
          new values.OutPointValue(cellDep.outPoint).equals(
            new values.OutPointValue(outPoint),
          ),
      ) > -1;
    if (existed) return cellDeps;
    return cellDeps.push({ outPoint, depType });
  });
}

export function parseOutputNumber(data: string) {
  if (data === "0x") return BI.from(0);

  if (data.length === 34) {
    return BI.from(number.Uint128LE.unpack(data).toBigInt());
  } else if (data.length === 18) {
    return BI.from(number.Uint64LE.unpack(data).toBigInt());
  }

  return BI.from(0);
}

const UNCOMPRESSED_KEY_LENGTH = 130;

export const compressPublicKey = (value: HexString): HexString => {
  const key = value.slice(2);
  if (key.length !== UNCOMPRESSED_KEY_LENGTH) {
    return key;
  }

  const publicKey = Buffer.from(key, "hex");
  const compressedPublicKey = Buffer.alloc(33)
    // '03' for odd value, '02' for even value
    .fill(publicKey[64] & 1 ? "03" : "02", 0, 1, "hex")
    .fill(publicKey.subarray(1, 33), 1, 33);
  return "0x" + compressedPublicKey.toString("hex");
};
