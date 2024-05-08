import { Hash } from "@ckb-lumos/base";
import { BI } from "@ckb-lumos/bi";

export enum TransactionType {
  SEND_NATIVE_TOKEN = "send_ckb",
  RECEIVE_NATIVE_TOKEN = "receive_ckb",
  SEND_TOKEN = "send_token",
  RECEIVE_TOKEN = "receive_token",
  // SEND_NFT = "send_nft",
  // RECEIVE_NFT = "receive_nft",
  DEPOSIT_DAO = "deposit_dao",
  WITHDRAW_DAO = "withdraw_dao",
  // UNLOCK_DAO = "unlock_dao",
  // SMART_CONTRACT_SEND = "smart_contract_send",
  // SMART_CONTRACT_RECEIVE = "smart_contract_receive",
}

export type Transaction = {
  hash: Hash;
  amount: BI;
  type: TransactionType;
  timestamp: number;
};
