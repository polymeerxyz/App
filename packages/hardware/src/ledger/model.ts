import { type RPC } from "@ckb-lumos/rpc/lib/types/rpc";

export type WalletPublicKey = {
  publicKey: string;
  lockArg: string;
  address: string;
};

export type ExtendPublicKey = {
  publicKey: string;
  chainCode: string;
};

export type AppConfiguration = {
  version: string;
  hash: string;
};

export type RawTransaction = Omit<RPC.RawTransaction, "witnesses">;

export type AnnotatedTransaction = {
  sign_path: number[];
  change_path: number[];
  input_count: number;
  raw: AnnotatedRawTransaction;
  witnesses: RPC.Witness[];
};

export type AnnotatedRawTransaction = {
  version: RPC.Version;
  cell_deps: RPC.CellDep[];
  header_deps: RPC.Hash256[];
  inputs: {
    input: RPC.CellInput;
    source: Omit<RPC.RawTransaction, "witnesses">;
  }[];
  outputs: RPC.CellOutput[];
  outputs_data: RPC.Bytes[];
};
