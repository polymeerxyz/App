import { Indexer } from "@ckb-lumos/ckb-indexer";
import { Config } from "@ckb-lumos/config-manager";
import { RPC } from "@ckb-lumos/rpc";
import { getConfig } from "@polymeerxyz/lib";
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from "react";

import { useNetworkStore } from "@/stores/network";

interface AppContextType {
  ckb: {
    config: Config;
    indexer: Indexer;
    rpc: RPC;
  };
}

export const AppContext = createContext<AppContextType>({} as any);

export const AppContextProvider = (props: PropsWithChildren) => {
  const { rpcUrl, type } = useNetworkStore((s) => s.config.nervosnetwork);

  const config = useMemo(() => getConfig(type === "mainnet"), [type]);
  const indexer = useMemo(() => new Indexer(rpcUrl), [rpcUrl]);
  const rpc = useMemo(() => new RPC(rpcUrl), [rpcUrl]);

  return <AppContext.Provider value={{ ckb: { config, indexer, rpc } }}>{props.children}</AppContext.Provider>;
};
