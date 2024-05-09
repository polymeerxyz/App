import { ckb } from "@polymeerxyz/lib";
import { useCallback, useRef } from "react";

import { getLedgerDevice } from "@/lib/ledger";
import { useAppContext } from "@/routes/hook";
import { useNetworkStore } from "@/stores/network";

export const useCellService = () => {
  const {
    ckb: { config, indexer, rpc },
  } = useAppContext();
  return useRef(new ckb.CellService(config, indexer, rpc));
};

export const useDaoService = () => {
  const {
    ckb: { config, indexer, rpc },
  } = useAppContext();
  return useRef(new ckb.DaoService(config, indexer, rpc));
};

export const useTransactionService = () => {
  const {
    ckb: { config, indexer, rpc },
  } = useAppContext();
  return useRef(new ckb.TransactionService(config, indexer, rpc));
};

export const useLedgerDevice = () => {
  const { rpcUrl, type } = useNetworkStore((s) => s.config.nervosnetwork);
  return useCallback(() => getLedgerDevice(type === "mainnet", rpcUrl), [rpcUrl, type]);
};
