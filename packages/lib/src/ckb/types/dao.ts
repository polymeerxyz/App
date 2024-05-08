import { Hash } from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";

export enum DaoType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

export type Dao = {
  hash: Hash;
  amount: BI;
  type: DaoType;
  timestamp: number;
};
