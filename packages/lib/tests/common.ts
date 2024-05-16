import { Indexer } from "@ckb-lumos/ckb-indexer";
import { ExtendedPrivateKey } from "@ckb-lumos/hd";
import { RPC } from "@ckb-lumos/rpc";

import { getConfig } from "../src/ckb/config";
import fixtures from "./fixtures.json";

export const getCommon = (mainnet: boolean) => {
  const url = mainnet
    ? "https://mainnet.ckbapp.dev/"
    : "https://testnet.ckbapp.dev/";
  const rpc = new RPC(url);
  const indexer = new Indexer(url);
  const config = getConfig(mainnet);

  return {
    rpc,
    indexer,
    config,
    extendedPrivateKey: fixtures.privateKey
      ? ExtendedPrivateKey.parse(fixtures.privateKey)
      : undefined,
  };
};
